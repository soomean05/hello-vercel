import type { SupabaseClient } from "@supabase/supabase-js";

export type CaptionItem = {
  id: string | number;
  content: string;
  imageUrl: string | null;
};

/** Derive caption text from row using common column names (schema-agnostic) */
function getCaptionText(row: Record<string, unknown>): string {
  const t =
    row.text ??
    row.caption_text ??
    row.captionText ??
    row.content ??
    row.body ??
    row.title ??
    row.name ??
    row.caption;
  if (t != null && typeof t === "string") return t;
  return "[no caption text column found]";
}

/** Derive image URL from row (only if row has it; never from captions.image_url if that column doesn't exist) */
function getImageUrlFromRow(row: Record<string, unknown>): string | null {
  const u = row.image_url ?? row.url ?? row.cdn_url;
  if (u != null && typeof u === "string") return u;
  return null;
}

/**
 * Safe caption fetch: uses select("*") so we never request missing columns.
 * Derives caption text and image URL from whatever columns exist.
 */
export async function fetchCaptionsSafe(
  supabase: SupabaseClient,
  limit = 50
): Promise<{ items: CaptionItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("captions")
    .select("*")
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
      const imageUrl =
        getImageUrlFromRow(c) ?? urlByImageId.get(String(c?.image_id)) ?? null;
      if (id == null) return null;
      return { id, content, imageUrl };
    })
    .filter((x): x is CaptionItem => x !== null);

  return { items, error: null };
}
