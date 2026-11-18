import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("item_id");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

  try {
    const adminSupabase = createAdminClient();

    let query = adminSupabase
      .from("inventory_logs")
      .select(
        `
        *,
        item:inventory_items(id, name, unit, category),
        creator:profiles!inventory_logs_created_by_fkey(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (itemId) {
      query = query.eq("item_id", itemId);
    }

    const { data: logs, error } = await query;

    if (error) {
      // If foreign key relationship alias fails, fallback to simple select
      const { data: fallbackLogs, error: fallbackError } = await adminSupabase
        .from("inventory_logs")
        .select(
          `
          *,
          item:inventory_items(id, name, unit, category)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }
      return NextResponse.json({ logs: fallbackLogs || [] });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch inventory logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
