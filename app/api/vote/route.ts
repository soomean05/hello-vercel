import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (userErr || !user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

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
        user_id: user.id,
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
