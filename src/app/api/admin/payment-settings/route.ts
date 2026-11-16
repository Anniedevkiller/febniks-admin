import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentSettingsSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("payment_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    settings: data || {
      id: 1,
      bank_name: "Moniepoint MFB",
      account_name: "FEBNIKS KITCHEN",
      account_number: "0000000000",
      instructions: "Use your Order Number as the transfer narration/remark.",
    },
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = paymentSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payment settings" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("payment_settings")
      .upsert(
        {
          id: 1,
          bank_name: parsed.data.bank_name,
          account_name: parsed.data.account_name,
          account_number: parsed.data.account_number,
          instructions: parsed.data.instructions || null,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
