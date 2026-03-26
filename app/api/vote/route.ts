import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  const token = trimmed.slice("bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function getUserIdFromBearerToken(token: string): string | null {
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
  const bearerToken = extractBearerToken(authHeader);

  console.log("[vote api] authorization header present:", !!authHeader, "bearerToken present:", !!bearerToken);

  if (!bearerToken) {
    return NextResponse.json(
      {
        error: "Not authenticated",
        details: {
          reason: "missing_or_invalid_authorization_header",
          hasAuthorizationHeader: !!authHeader,
        },
      },
      { status: 401 }
    );
  }

  const decodedUserId = getUserIdFromBearerToken(bearerToken);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // Route handler: no cookie refresh needed for this endpoint.
        },
      },
      // Ensure PostgREST/RLS sees the bearer token even when cookies are absent.
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    } as any
  );

  let user: any = decodedUserId ? { id: decodedUserId } : null;
  let supabaseAuthError: string | null = null;
  try {
    const { data, error } = await (supabase.auth as any).getUser(bearerToken);
    if (error) {
      supabaseAuthError = error.message ?? String(error);
    } else if (data?.user) {
      user = data.user;
    }
  } catch (e: any) {
    supabaseAuthError = e?.message ?? String(e);
  }

  if (!user?.id) {
    return NextResponse.json(
      {
        error: "Not authenticated",
        details: {
          reason: "invalid_token_or_missing_sub",
          decodedUserId,
          supabaseAuthError,
        },
      },
      { status: 401 }
    );
  }

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
