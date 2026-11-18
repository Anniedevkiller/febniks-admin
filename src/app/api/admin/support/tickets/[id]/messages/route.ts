import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { supportMessageSchema } from "@/lib/validations";

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
  const { data: messages, error } = await adminSupabase
    .from("support_messages")
    .select(`
      *,
      profiles:sender_id (
        id,
        full_name,
        email,
        avatar_url,
        role
      )
    `)
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [] });
}

export async function POST(
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
    const parsed = supportMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid message body" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: message, error: messageError } = await adminSupabase
      .from("support_messages")
      .insert({
        ticket_id: id,
        sender_id: auth.user.id,
        sender_role: "admin",
        body: parsed.data.body,
        created_at: now,
      })
      .select(`
        *,
        profiles:sender_id (
          id,
          full_name,
          email,
          avatar_url,
          role
        )
      `)
      .single();

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 400 });
    }

    // Update ticket's last_message_at and updated_at
    await adminSupabase
      .from("support_tickets")
      .update({
        last_message_at: now,
        updated_at: now,
      })
      .eq("id", id);

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
