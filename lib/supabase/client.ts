"use client";

import { createBrowserClient } from "@supabase/ssr";

let supabaseBrowserSingleton:
  | ReturnType<typeof createBrowserClient>
  | null = null;

// Shared browser Supabase client singleton.
// Multiple calls to `createSupabaseBrowserClient()` will return the same instance,
// preventing auth/session inconsistencies across components.
export function createSupabaseBrowserClient() {
  if (supabaseBrowserSingleton) return supabaseBrowserSingleton;

  supabaseBrowserSingleton = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseBrowserSingleton;
}
