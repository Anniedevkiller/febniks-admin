import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") === "asc" ? true : false;

  const adminSupabase = createAdminClient();
  let query = adminSupabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: sort });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate short-lived signed URLs for orders that have payment_proof_path when requested
  const withReceipts = searchParams.get("receipts") === "1";
  if (withReceipts && data) {
    const enriched = await Promise.all(
      data.map(async (order) => {
        if (!order.payment_proof_path) return { ...order, receipt_signed_url: null };
        const { data: signed } = await adminSupabase.storage
          .from("payment-proofs")
          .createSignedUrl(order.payment_proof_path, 300); // 5 minutes expiry
        return {
          ...order,
          receipt_signed_url: signed?.signedUrl ?? null,
        };
      })
    );
    return NextResponse.json({ orders: enriched });
  }

  return NextResponse.json({ orders: data ?? [] });
}
