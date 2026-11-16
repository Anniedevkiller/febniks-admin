import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrderStatusSchema } from "@/lib/validations";
import { VALID_FULFILLMENT_TRANSITIONS, type Order, type OrderItem, type OrderStatus } from "@/lib/types";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

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

  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid status transition" },
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

  const currentStatus = existingOrder.status as OrderStatus;
  const targetStatus = parsed.data.status as OrderStatus;

  const allowedTargets = VALID_FULFILLMENT_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(targetStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from "${currentStatus}" to "${targetStatus}". The kitchen only starts on "paid".`,
      },
      { status: 400 }
    );
  }

  const updateFields: Record<string, unknown> = {
    status: targetStatus,
  };
  if (parsed.data.admin_note !== undefined && parsed.data.admin_note !== null) {
    updateFields.admin_note = parsed.data.admin_note;
  }

  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from("orders")
    .update(updateFields)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (updateError || !updatedOrder) {
    return NextResponse.json(
      { error: updateError?.message || "Failed to update order status" },
      { status: 400 }
    );
  }

  const emailResult = await sendOrderStatusUpdateEmail(
    updatedOrder as Order,
    (updatedOrder.order_items || []) as OrderItem[],
    targetStatus
  );

  return NextResponse.json({
    order: updatedOrder,
    email_sent: emailResult.sent,
    email_error: emailResult.error,
  });
}
