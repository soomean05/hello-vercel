import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientFromRequest } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim();
  if (!token) {
    const supabase = createSupabaseServerClientFromRequest(req);
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? undefined;
  }
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  const isCommonUse = body?.isCommonUse ?? false;
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  const r = await fetch("https://api.almostcrackd.ai/pipeline/upload-image-from-url", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, isCommonUse }),
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}
