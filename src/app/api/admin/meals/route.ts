import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { mealSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("meals")
    .select("*, categories(*)")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meals: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = mealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid meal data" },
        { status: 400 }
      );
    }

    const payload = {
      ...parsed.data,
      image_url: parsed.data.image_url || null,
      description: parsed.data.description || null,
      category_id: parsed.data.category_id || null,
    };

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("meals")
      .insert(payload)
      .select("*, categories(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ meal: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
