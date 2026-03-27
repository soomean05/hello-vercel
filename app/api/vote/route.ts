import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

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
    const { caption_id, vote } = body;

    if (!caption_id || ![1, -1].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("caption_votes")
      .upsert(
        {
          caption_id,
          profile_id: user.id,
          user_id: user.id,
          vote_value: vote,
          created_by_user_id: user.id,
          modified_by_user_id: user.id,
        },
        {
          onConflict: "caption_id,user_id",
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vote route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
