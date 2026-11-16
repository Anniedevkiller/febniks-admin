import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  return NextResponse.json({ profile: auth.profile });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
      })
      .eq("id", auth.user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
