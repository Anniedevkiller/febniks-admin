import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid("Invalid order ID");

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data: order, error } = await adminSupabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message || "Order not found" },
      { status: 404 }
    );
  }

  let receiptSignedUrl: string | null = null;
  if (order.payment_proof_path) {
    const { data: signed } = await adminSupabase.storage
      .from("payment-proofs")
      .createSignedUrl(order.payment_proof_path, 300); // 5 min short expiry
    receiptSignedUrl = signed?.signedUrl ?? null;
  }

  let confirmedByProfile = null;
  if (order.confirmed_by) {
    const { data: adminProfile } = await adminSupabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", order.confirmed_by)
      .single();
    confirmedByProfile = adminProfile;
  }

  return NextResponse.json({
    order,
    receipt_signed_url: receiptSignedUrl,
    confirmed_by_profile: confirmedByProfile,
  });
}
