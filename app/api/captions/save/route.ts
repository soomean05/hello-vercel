import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientFromRequest } from "@/lib/supabase/server";

function getUserIdFromToken(token: string): string | null {
  try {
    const b64 = token.split(".")[1];
    if (!b64) return null;
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
  const supabase = createSupabaseServerClientFromRequest(req);
  let userId: string | null = null;

  if (token) {
    userId = getUserIdFromToken(token);
  }
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  const captions = body?.captions;
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }
  if (!Array.isArray(captions) || captions.length === 0) {
    return NextResponse.json({ error: "Missing or empty captions array" }, { status: 400 });
  }

  const textList = captions.map((c) => (typeof c === "string" ? c : c?.content ?? c?.text ?? c?.caption ?? String(c)));

  const { data: imgRow, error: imgErr } = await supabase
    .from("images")
    .insert({
      url: imageUrl,
      created_by_user_id: userId,
      modified_by_user_id: userId,
    })
    .select("id")
    .single();

  if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 400 });

  const capRows = textList.map((text) => ({
    image_id: imgRow.id,
    content: text,
    profile_id: userId,
    is_public: true,
    created_by_user_id: userId,
    modified_by_user_id: userId,
  }));

  const { error: capErr } = await supabase.from("captions").insert(capRows);
  if (capErr) return NextResponse.json({ error: capErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
