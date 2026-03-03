import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return NextResponse.redirect(new URL("/", url.origin));

  const store = await cookies();
  const supabase = await createSupabaseServerClient(store);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) return NextResponse.redirect(new URL("/?error=oauth", url.origin));

  const nextPath = store.get("next_path")?.value;
  const safeNext =
    nextPath && typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/protected";

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
