import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      return NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { caption_id, vote } = body as { caption_id?: string | number; vote?: unknown };

    if (!caption_id || ![1, -1].includes(vote as number)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const voteValue = vote as 1 | -1;

    const { error: insertError } = await supabase.from("caption_votes").insert({
      caption_id,
      profile_id: user.id,
      user_id: user.id,
      vote_value: voteValue,
      value: voteValue,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    });

    // Preserve existing "upsert-like" behavior for duplicate vote rows
    if (insertError) {
      if (insertError.code === "23505") {
        const { error: updateError } = await supabase
          .from("caption_votes")
          .update({
            vote_value: voteValue,
            value: voteValue,
            modified_by_user_id: user.id,
          })
          .eq("profile_id", user.id)
          .eq("caption_id", caption_id);

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true }, { status: 200 });
      }

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vote route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
