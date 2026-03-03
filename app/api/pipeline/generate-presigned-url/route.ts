import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

export async function POST(req: Request) {
  let token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim();
  if (!token) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? undefined;
  }
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const contentType = body?.contentType;
  if (!contentType || typeof contentType !== "string" || !ALLOWED.has(contentType)) {
    return NextResponse.json({ error: `Unsupported contentType: ${contentType}` }, { status: 400 });
  }

  const r = await fetch("https://api.almostcrackd.ai/pipeline/generate-presigned-url", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}
