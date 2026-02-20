import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Must be logged in
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const caption_id = body.caption_id;
  const vote = body.vote; // 1 or -1

  if (!caption_id || (vote !== 1 && vote !== -1)) {
    return NextResponse.json(
      { error: "Expected caption_id and vote (1 or -1)" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  // Try INSERT first
  const { error: insertError } = await supabase.from("caption_votes").insert({
    caption_id,
    profile_id: user.id,
    vote_value: vote,
    created_datetime_utc: now,
    modified_datetime_utc: now,
  });

  // If insert succeeded
  if (!insertError) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // If duplicate key, UPDATE existing vote instead
  if ((insertError as any).code === "23505") {
    const { error: updateError } = await supabase
      .from("caption_votes")
      .update({
        vote_value: vote,
        modified_datetime_utc: now,
      })
      .eq("caption_id", caption_id)
      .eq("profile_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Any other error
  return NextResponse.json({ error: insertError.message }, { status: 400 });
}
