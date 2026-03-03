import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("captions").select("*").limit(1);

  const columns = data?.[0] ? Object.keys(data[0]) : [];
  const firstRow = data?.[0] ?? null;

  return NextResponse.json({
    columns,
    firstRow,
    error: error?.message ?? null,
  });
}
