import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { mealUpdateSchema } from "@/lib/validations";

const idSchema = z.string().uuid("Invalid meal ID");

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = mealUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid meal update" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = { ...parsed.data };
    if ("image_url" in updatePayload && updatePayload.image_url === "") {
      updatePayload.image_url = null;
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("meals")
      .update(updatePayload)
      .eq("id", id)
      .select("*, categories(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ meal: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("meals").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
