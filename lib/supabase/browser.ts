import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

const url: string = supabaseUrl;
const key: string = supabaseAnonKey;

export function createBrowserClient() {
  return createSupabaseBrowserClient(url, key);
}

export const supabaseBrowserClient = createSupabaseBrowserClient(url, key);
