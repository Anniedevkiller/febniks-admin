import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { inventoryItemSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const adminSupabase = createAdminClient();
  const { data: items, error } = await adminSupabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: items || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = inventoryItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid inventory item data" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data: item, error } = await adminSupabase
      .from("inventory_items")
      .insert({
        name: parsed.data.name,
        category: parsed.data.category || null,
        unit: parsed.data.unit,
        quantity: parsed.data.quantity,
        low_level: parsed.data.low_level,
        critical_level: parsed.data.critical_level,
        is_active: parsed.data.is_active,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If initial quantity > 0, log initial stock record
    if (parsed.data.quantity > 0 && item) {
      await adminSupabase.from("inventory_logs").insert({
        item_id: item.id,
        change: parsed.data.quantity,
        quantity_after: parsed.data.quantity,
        reason: "Initial Stock",
        note: "Initial stock when item was created",
        created_by: auth.user.id,
      });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
