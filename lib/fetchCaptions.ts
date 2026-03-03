import type { SupabaseClient } from "@supabase/supabase-js";

export type CaptionRow = {
  id: string | number;
  text?: string | null;
  content?: string | null;
  caption?: string | null;
  created_at?: string | null;
  image_id?: string | null;
  images?: { url?: string | null } | null;
};

export type CaptionItem = {
  id: string | number;
  content: string;
  imageUrl: string | null;
};

function getCaptionText(row: Record<string, unknown>): string {
  const t = row.text ?? row.caption ?? row.content;
  if (t != null && typeof t === "string") return t;
  return "(no caption text column found)";
}

/** Safe caption fetch: never select captions.image_url, fallbacks for schema variations */
export async function fetchCaptionsSafe(
  supabase: SupabaseClient,
  limit = 50
): Promise<{ items: CaptionItem[]; error: string | null }> {
  let rows: CaptionRow[] = [];
  let urlByImageId = new Map<string, string>();
  let data: unknown[] | null = null;
  let error: { message: string } | null = null;

  const selects = [
    "id, content, created_at, image_id",
    "id, content, created_at",
    "id, text, created_at, image_id",
    "id, text, created_at",
    "id, caption, created_at, image_id",
    "id, caption, created_at",
  ];

  for (const selectStr of selects) {
    const { data: d, error: e } = await supabase
      .from("captions")
      .select(selectStr)
      .limit(limit);
    if (!e) {
      data = d;
      error = null;
      break;
    }
    error = e;
    if (
      e.message?.includes("does not exist") ||
      e.message?.includes("column")
    ) {
      continue;
    }
    return { items: [], error: e.message };
  }

  if (error) {
    return { items: [], error: error.message };
  }

  rows = (data ?? []) as CaptionRow[];

  const hasImageId = rows.some((c) => c?.image_id);
  if (hasImageId) {
    const imageIds = Array.from(
      new Set(rows.map((c) => c?.image_id).filter(Boolean).map(String))
    );
    if (imageIds.length > 0) {
      const { data: images, error: imgErr } = await supabase
        .from("images")
        .select("id, url")
        .in("id", imageIds);
      if (!imgErr && images) {
        images.forEach((im: { id?: string; url?: string }) => {
          if (im?.id && im?.url) urlByImageId.set(String(im.id), String(im.url));
        });
      }
    }
  }

  const items: CaptionItem[] = rows
    .map((c) => {
      const id = c?.id;
      const content = getCaptionText(c as Record<string, unknown>);
      const imageUrl = urlByImageId.get(String(c?.image_id)) ?? null;
      if (!id) return null;
      return { id, content, imageUrl };
    })
    .filter((x): x is CaptionItem => x !== null);

  return { items, error: null };
}
