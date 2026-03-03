import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClientFromRequest } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClientFromRequest(request);
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ token });
}
