import { NextResponse } from "next/server";

const BASE = "https://api.almostcrackd.ai";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

export async function POST(req: Request) {
  // ✅ read token from Authorization header
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const step = body?.step;

  try {
    if (step === "presign") {
      const contentType = body?.contentType as string | undefined;

      if (!contentType || !ALLOWED.has(contentType)) {
        return NextResponse.json(
          { error: `Unsupported contentType: ${contentType}` },
          { status: 400 }
        );
      }

      const r = await fetch(`${BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        return NextResponse.json(
          { error: j?.error ?? j?.message ?? "Presign failed" },
          { status: r.status }
        );
      }
      return NextResponse.json(j);
    }

    if (step === "register") {
      const imageUrl = body?.imageUrl as string | undefined;
      if (!imageUrl) {
        return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
      }

      const r = await fetch(`${BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, isCommonUse: false }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        return NextResponse.json(
          { error: j?.error ?? j?.message ?? "Register failed" },
          { status: r.status }
        );
      }
      return NextResponse.json(j);
    }

    if (step === "captions") {
      const imageId = body?.imageId as string | undefined;
      if (!imageId) {
        return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
      }

      const r = await fetch(`${BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        return NextResponse.json(
          { error: j?.error ?? j?.message ?? "Caption generation failed" },
          { status: r.status }
        );
      }
      return NextResponse.json(j);
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
