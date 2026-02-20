import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "./signout-button";
import CaptionRater from "@/app/components/CaptionRater";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main style={{ padding: 40 }}>
        <p>You must sign in to rate captions.</p>
      </main>
    );
  }

  // ✅ FETCH CAPTIONS FIRST (THIS WAS MISSING)
  const { data: captionsData, error: captionsError } = await supabase
    .from("captions")
    .select("id, content, image_id")
    .not("image_id", "is", null)
    .limit(8000);

  if (captionsError) {
    return (
      <main style={{ padding: 40 }}>
        <p>Error loading captions: {captionsError.message}</p>
      </main>
    );
  }

  const captions = captionsData ?? [];

  // ✅ GROUP BY IMAGE_ID (MAX 10 EACH)
  const byImage = new Map<
    string,
    { id: string; content: string; image_id: string }[]
  >();

  for (const c of captions as any[]) {
    const imgId = c.image_id ? String(c.image_id) : "";
    if (!imgId) continue;

    const arr = byImage.get(imgId) ?? [];
    if (arr.length >= 10) continue;

    arr.push({
      id: String(c.id),
      content: String(c.content ?? ""),
      image_id: imgId,
    });

    byImage.set(imgId, arr);
  }

  const imageIds = Array.from(byImage.keys());

  // ✅ FETCH IMAGE URLS
  const imageUrlById: Record<string, string> = {};

  if (imageIds.length > 0) {
    const { data: imagesData } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);

    for (const img of (imagesData ?? []) as any[]) {
      if (img?.id && img?.url) {
        imageUrlById[String(img.id)] = String(img.url);
      }
    }
  }

  // ✅ ROUND ROBIN MIXING
  const imageGroups = Array.from(byImage.entries())
    .map(([imgId, caps]) => ({
      imgId,
      captions: caps.filter((c) => imageUrlById[imgId]),
    }))
    .filter((g) => g.captions.length > 0);

  const mixed: {
    id: string;
    content: string;
    imageUrl: string;
  }[] = [];

  let stillHasItems = true;

  while (stillHasItems) {
    stillHasItems = false;

    for (const group of imageGroups) {
      if (group.captions.length > 0) {
        const cap = group.captions.shift()!;
        mixed.push({
          id: cap.id,
          content: cap.content,
          imageUrl: imageUrlById[group.imgId],
        });
        stillHasItems = true;
      }
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f6f7f9",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 760,
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0 }}>Protected</h1>
            <p>Signed in as: {user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <hr style={{ margin: "20px 0" }} />

        {mixed.length === 0 ? (
          <p>No captions with images found.</p>
        ) : (
          <CaptionRater captions={mixed} />
        )}
      </section>
    </main>
  );
}
