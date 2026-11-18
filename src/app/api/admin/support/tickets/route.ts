import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ticketCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  const adminSupabase = createAdminClient();

  let query = adminSupabase
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
        total
      )
    `)
    .order("last_message_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (priority && priority !== "all") {
    query = query.eq("priority", priority);
  }
  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let tickets = data || [];

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    tickets = tickets.filter((t: any) => {
      const matchNumber = t.ticket_number?.toLowerCase().includes(q);
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchCustomer = t.profiles?.full_name?.toLowerCase().includes(q) || t.profiles?.email?.toLowerCase().includes(q);
      const matchOrder = t.orders?.order_number?.toLowerCase().includes(q);
      return matchNumber || matchSubject || matchCustomer || matchOrder;
    });
  }

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = ticketCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid ticket data" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Determine target user_id for the ticket
    let targetUserId = parsed.data.user_id;

    if (!targetUserId && parsed.data.customer_email) {
      const { data: matchedProfile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("email", parsed.data.customer_email.trim().toLowerCase())
        .maybeSingle();

      if (matchedProfile) {
        targetUserId = matchedProfile.id;
      }
    }

    // If still no user_id, fallback to current admin user
    if (!targetUserId) {
      targetUserId = auth.user.id;
    }

    const { data: newTicket, error: ticketError } = await adminSupabase
      .from("support_tickets")
      .insert({
        user_id: targetUserId,
        order_id: parsed.data.order_id || null,
        subject: parsed.data.subject,
        type: parsed.data.type,
        priority: parsed.data.priority,
        status: "open",
        last_message_at: new Date().toISOString(),
      })
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

    if (ticketError || !newTicket) {
      return NextResponse.json(
        { error: ticketError?.message || "Failed to create ticket" },
        { status: 400 }
      );
    }

    // Insert the initial message
    if (parsed.data.initial_message) {
      await adminSupabase.from("support_messages").insert({
        ticket_id: newTicket.id,
        sender_id: auth.user.id,
        sender_role: "admin",
        body: parsed.data.initial_message,
      });
    }

    return NextResponse.json({ ticket: newTicket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
