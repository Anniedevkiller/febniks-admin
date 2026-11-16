import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const adminSupabase = createAdminClient();
  const [{ data: profiles, error: profError }, { data: orders }] = await Promise.all([
    adminSupabase.from("profiles").select("*").order("full_name", { ascending: true }),
    adminSupabase.from("orders").select("id, user_id, customer_email"),
  ]);

  if (profError) {
    return NextResponse.json({ error: profError.message }, { status: 500 });
  }

  const orderCountByUser = new Map<string, number>();
  (orders || []).forEach((o) => {
    if (o.user_id) {
      orderCountByUser.set(o.user_id, (orderCountByUser.get(o.user_id) || 0) + 1);
    }
  });

  const users = (profiles || []).map((p) => ({
    ...p,
    order_count: orderCountByUser.get(p.id) || 0,
  }));

  return NextResponse.json({ users });
}
