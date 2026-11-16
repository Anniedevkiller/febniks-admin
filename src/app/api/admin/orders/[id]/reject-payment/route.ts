import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { rejectPaymentSchema } from "@/lib/validations";
import { sendPaymentRejectedEmail } from "@/lib/email";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = rejectPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Admin note is required to reject payment" },
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
        error: `Cannot reject payment: order status is "${existingOrder.status}" (must be "awaiting_confirmation").`,
      },
      { status: 400 }
    );
  }

  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from("orders")
    .update({
      status: "payment_rejected",
      admin_note: parsed.data.admin_note,
    })
    .eq("id", id)
    .eq("status", "awaiting_confirmation")
    .select("*, order_items(*)")
    .single();

  if (updateError || !updatedOrder) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to reject payment" },
      { status: 400 }
    );
  }

  const emailResult = await sendPaymentRejectedEmail(
    updatedOrder as Order,
    (updatedOrder.order_items || []) as OrderItem[]
  );

  return NextResponse.json({
    order: updatedOrder,
    email_sent: emailResult.sent,
    email_error: emailResult.error,
  });
}
