export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
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

  // Persist intended destination without adding params to redirectTo.
  // Callback will read this cookie and redirect there.
  const store = await cookies();
  store.set("next_path", next, { path: "/", sameSite: "lax", maxAge: 60 * 10 });

  // If already logged in (SSR cookies), skip the login UI.
  const supabase = await createSupabaseServerClient(store);
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(next);

  return <LoginClient next={next} />;
}
