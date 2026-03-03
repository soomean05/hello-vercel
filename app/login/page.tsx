export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import LoginClient from "./login-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(input: unknown): string {
  if (typeof input !== "string") return "/protected";
  if (!input.startsWith("/")) return "/protected";
  if (input.startsWith("//")) return "/protected";
  return input;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = safeNextPath(searchParams?.next ?? "/protected");

  // next_path cookie is set by middleware (pages cannot modify cookies).
  // If already logged in (SSR cookies), skip the login UI.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(next);

  return <LoginClient next={next} />;
}
