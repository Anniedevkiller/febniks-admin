import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { inventoryAdjustSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = inventoryAdjustSchema.safeParse({
      p_item_id: body.p_item_id || body.item_id,
      p_change: body.p_change !== undefined ? body.p_change : body.change,
      p_reason: body.p_reason || body.reason || "adjustment",
      p_note: body.p_note !== undefined ? body.p_note : body.note,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { p_item_id, p_change, p_reason, p_note } = parsed.data;
    const adminSupabase = createAdminClient();

    const { data: updatedQuantity, error } = await adminSupabase.rpc("adjust_inventory", {
      p_item_id,
      p_change,
      p_reason,
      p_note: p_note ?? null,
      p_user: auth.user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the updated item to return full state
    const { data: item } = await adminSupabase
      .from("inventory_items")
      .select("*")
      .eq("id", p_item_id)
      .single();

    return NextResponse.json({
      success: true,
      new_quantity: updatedQuantity,
      item,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to adjust inventory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
