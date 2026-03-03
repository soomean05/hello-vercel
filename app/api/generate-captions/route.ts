import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const imageUrl = body?.imageUrl as string | undefined;

  if (!imageUrl) return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });

  // If you have a real caption API, put it here later.
  return NextResponse.json({
    captions: [
      "POV: you opened the front camera by accident",
      "Me pretending I’m fine after one (1) assignment",
      "When you realize it’s due at 11:59 and it’s 11:58",
      "I said I’d sleep early. I lied.",
      "Brain loading… please wait",
    ],
  });
}
