"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getAuthToken(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;

  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return json.token ?? null;
}
