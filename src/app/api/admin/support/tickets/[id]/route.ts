import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ticketUpdateSchema } from "@/lib/validations";

const idSchema = z.string().uuid("Invalid ticket ID");

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data: ticket, error } = await adminSupabase
    .from("support_tickets")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        role
      ),
      orders:order_id (
        id,
        order_number,
        status,
        total,
        subtotal,
        delivery_fee,
        delivery_address,
        created_at,
        order_items (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { error: error?.message || "Ticket not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = ticketUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const adminSupabase = createAdminClient();
    const { data: ticket, error } = await adminSupabase
      .from("support_tickets")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone,
          avatar_url,
          role
        ),
        orders:order_id (
          id,
          order_number,
          status,
          total
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
