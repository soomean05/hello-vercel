import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientFromRequest } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClientFromRequest(req);
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // Prefer cookie/session auth first (existing behavior), but fall back to bearer token auth
  // so voting works end-to-end even if cookies aren't present for this request.
  const { data: userData0, error: userErr0 } = await supabase.auth.getUser();
  let user = userData0.user;
  let userErr = userErr0;

  if ((!user || userErr) && bearerToken) {
    try {
      const { data: userData1, error: userErr1 } = await (supabase.auth as any).getUser(
        bearerToken
      );
      user = userData1?.user;
      userErr = userErr1;
    } catch (e: any) {
      userErr = e;
      user = null;
    }
  }

  if (userErr || !user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const captionId = (body.captionId ?? body.caption_id) as string | undefined;
  const direction = body.direction as "up" | "down" | undefined;
  const voteValueFromBody = body.voteValue ?? body.vote;

  let voteValue: number;
  if (direction === "up") voteValue = 1;
  else if (direction === "down") voteValue = -1;
  else if (typeof voteValueFromBody === "number" && (voteValueFromBody === 1 || voteValueFromBody === -1)) {
    voteValue = voteValueFromBody;
  } else {
    return NextResponse.json(
      { error: "Expected captionId and direction (up|down) or voteValue (1|-1)" },
      { status: 400 }
    );
  }

  const captionIdStr = captionId != null ? String(captionId) : "";
  if (!captionIdStr) {
    return NextResponse.json({ error: "Missing captionId" }, { status: 400 });
  }

  const payload = {
    caption_id: captionIdStr,
    profile_id: user.id,
    user_id: user.id,
    vote_value: voteValue,
    value: voteValue,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  };

  const { error: insertErr } = await supabase.from("caption_votes").insert(payload);

  if (insertErr) {
    if (insertErr.code === "23505") {
      const { error: updateErr } = await supabase
        .from("caption_votes")
        .update({
          vote_value: voteValue,
          value: voteValue,
          modified_by_user_id: user.id,
        })
        .eq("profile_id", user.id)
        .eq("caption_id", captionIdStr);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
