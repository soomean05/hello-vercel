import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const next = body?.next;
  const safe = typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/rate";

  const res = NextResponse.json({ ok: true });
  res.cookies.set("next_path", safe, { path: "/", sameSite: "lax", maxAge: 60 * 10 });
  return res;
}
