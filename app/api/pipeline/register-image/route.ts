import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BASE_URL = "https://api.almostcrackd.ai";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();

    const token = sessionData.session?.access_token;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const imageUrl = body?.imageUrl;
    const isCommonUse = body?.isCommonUse ?? false;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const resp = await fetch(`${BASE_URL}/pipeline/upload-image-from-url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, isCommonUse }),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
