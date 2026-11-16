import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPaymentSchema } from "@/lib/validations";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import type { Order, OrderItem } from "@/lib/types";

const idSchema = z.string().uuid("Invalid order ID");

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = confirmPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();
  const { data: existingOrder, error: fetchError } = await adminSupabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (fetchError || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existingOrder.status !== "awaiting_confirmation") {
    return NextResponse.json(
      {
        error: `Cannot confirm payment: order status is "${existingOrder.status}" (must be "awaiting_confirmation").`,
      },
      { status: 400 }
    );
  }

  const updateFields: Record<string, unknown> = {
    status: "paid",
    confirmed_by: auth.user.id,
    confirmed_at: new Date().toISOString(),
  };

  if (parsed.data.admin_note !== undefined) {
    updateFields.admin_note = parsed.data.admin_note;
  }

  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from("orders")
    .update(updateFields)
    .eq("id", id)
    .eq("status", "awaiting_confirmation")
    .select("*, order_items(*)")
    .single();

  if (updateError || !updatedOrder) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to confirm payment" },
      { status: 400 }
    );
  }

  const emailResult = await sendPaymentConfirmedEmail(
    updatedOrder as Order,
    (updatedOrder.order_items || []) as OrderItem[]
  );

  return NextResponse.json({
    order: updatedOrder,
    email_sent: emailResult.sent,
    email_error: emailResult.error,
  });
}
