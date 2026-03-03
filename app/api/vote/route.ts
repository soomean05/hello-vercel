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

  if (token) userId = getUserIdFromToken(token);
  if (!userId) {
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const caption_id = body.caption_id;
  const vote = body.vote;

  if (!caption_id || (vote !== 1 && vote !== -1)) {
    return NextResponse.json(
      { error: "Expected caption_id and vote (1 or -1)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Your schema: vote_value, UNIQUE(caption_id, user_id)
  const { error } = await supabase
    .from("caption_votes")
    .upsert(
      {
        caption_id,
        user_id: userId,
        vote_value: vote,
        created_datetime_utc: now,
        modified_datetime_utc: now,
      },
      { onConflict: "caption_id,user_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
