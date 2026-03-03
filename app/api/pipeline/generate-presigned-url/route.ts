import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const body = await req.json();

  const r = await fetch("https://api.almostcrackd.ai/pipeline/generate-presigned-url", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}
