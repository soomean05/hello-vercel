import type { SupabaseClient } from "@supabase/supabase-js";

export type CaptionItem = {
  id: string | number;
  content: string;
  imageUrl: string | null;
};

/** Derive caption text from row using common column names (schema-agnostic) */
function getCaptionText(row: Record<string, unknown>): string | null {
  // Primary source for caption text in this project.
  const content = row.content;
  if (typeof content === "string" && content.trim().length > 0) return content;

  // Optional legacy fallbacks (only used if `content` isn't present).
  const legacy =
    row.text ??
    row.caption_text ??
    row.captionText ??
    row.body ??
    row.title ??
    row.name ??
    row.caption;
  if (typeof legacy === "string" && legacy.trim().length > 0) return legacy;

  return null;
}

/** Derive image URL from row (only if row has it; never from captions.image_url if that column doesn't exist) */
function getImageUrlFromRow(row: Record<string, unknown>): string | null {
  const u = row.image_url ?? row.url ?? row.cdn_url;
  if (u != null && typeof u === "string") return u;
  return null;
}

/**
 * Safe caption fetch: selects only the columns this project needs.
 * Derives image URL from `images.url` via `captions.image_id`.
 */
export async function fetchCaptionsSafe(
  supabase: SupabaseClient,
  limit = 50
): Promise<{ items: CaptionItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("captions")
    .select("id, content, image_id")
    .limit(limit);

  if (error) {
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const urlByImageId = new Map<string, string>();

  const hasImageId = rows.some((c) => c?.image_id != null);
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
        (images as { id?: string; url?: string }[]).forEach((im) => {
          if (im?.id && im?.url) urlByImageId.set(String(im.id), String(im.url));
        });
      }
    }
  }

  const items: CaptionItem[] = rows
    .map((c) => {
      const id = c?.id;
      const content = getCaptionText(c);

      // Skip rows with missing/empty caption text so the feed never shows
      // broken placeholder text.
      if (id == null || !content) return null;

      const imageUrl =
        getImageUrlFromRow(c) ?? urlByImageId.get(String(c?.image_id)) ?? null;

      return { id, content, imageUrl };
    })
    .filter((x): x is CaptionItem => x !== null);

  return { items, error: null };
}
