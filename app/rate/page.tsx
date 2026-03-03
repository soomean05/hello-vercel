import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Navbar from "../components/Navbar";
import RateClient from "./rate-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RatePage() {
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();

  const email = userRes.user?.email;
  if (!userRes.user || !email) redirect("/");

  const { data: captions, error: capErr } = await supabase
    .from("captions")
    .select("id, content, text, image_id, image_url")
    .limit(200);

  if (capErr) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <div style={{ color: "crimson", fontWeight: 900 }}>Error loading captions</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{capErr.message}</pre>
      </main>
    );
  }

  const captionRows = (captions ?? []) as any[];

  // Try to map captions → items with an imageUrl. If caption already has image_url, use it;
  // otherwise join via images table using image_id.
  const needsImageJoin = captionRows.some((c) => !c?.image_url) && captionRows.some((c) => c?.image_id);

  let urlByImageId = new Map<string, string>();
  if (needsImageJoin) {
    const imageIds = Array.from(
      new Set(captionRows.map((c) => c?.image_id).filter(Boolean).map(String))
    );

    if (imageIds.length > 0) {
      const { data: images } = await supabase
        .from("images")
        .select("id, url")
        .in("id", imageIds);

      (images ?? []).forEach((im: any) => {
        if (im?.id && im?.url) urlByImageId.set(String(im.id), String(im.url));
      });
    }
  }

  const items = captionRows
    .map((c) => {
      const id = c?.id;
      const content = String(c?.content ?? c?.text ?? "");
      const imageUrl = (c?.image_url as string | null) ?? urlByImageId.get(String(c?.image_id)) ?? null;

      if (!id || !content) return null;
      return { id, content, imageUrl };
    })
    .filter(Boolean) as { id: string | number; content: string; imageUrl: string | null }[];

  return (
    <>
      <Navbar />
      <RateClient email={email} items={items} />
    </>
  );
}
