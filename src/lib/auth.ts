"use client";

import { createClient } from "@/lib/supabase/client";

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem("febniks_remember_email");
  }
}
