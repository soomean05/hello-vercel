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
  const imageId = body?.imageId;
  if (!imageId || typeof imageId !== "string") {
    return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
  }

  const r = await fetch("https://api.almostcrackd.ai/pipeline/generate-captions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ imageId }),
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}
