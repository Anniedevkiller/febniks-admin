import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function requireAdmin(): Promise<
  | { authorized: true; user: { id: string; email?: string }; profile: Profile }
  | { authorized: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized: Please sign in." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Access denied: Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: { id: user.id, email: user.email },
    profile: profile as Profile,
  };
}
