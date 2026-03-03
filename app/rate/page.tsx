"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FeedItem = {
  imageId: string;
  imageUrl: string;
  captionId: string;
  captionText: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [idx, setIdx] = useState(0);

  const current = useMemo(() => feed[idx] ?? null, [feed, idx]);

  // 1) Require auth
  useEffect(() => {
    (async () => {
      try {
        if (!supabase) {
          setError(
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (!data.user) {
          router.replace(`/login?next=/rate`);
          return;
        }

        setUserId(data.user.id);
      } catch (e: any) {
        setError(e?.message ?? String(e));
        setLoading(false);
      }
    })();
  }, [router]);

  // 2) Load feed of (image, caption)
  useEffect(() => {
    (async () => {
      if (!supabase || !userId) return;

      setLoading(true);
      setError(null);

      try {
        // Pull a bunch of captions with their image id
        const { data: captions, error: capErr } = await supabase
          .from("captions")
          .select("id,text,image_id")
          .limit(200);

        if (capErr) throw capErr;
        if (!captions || captions.length === 0) {
          setFeed([]);
          setLoading(false);
          return;
        }

        // Collect image ids and fetch image URLs
        const imageIds = Array.from(
          new Set(captions.map((c: any) => c.image_id).filter(Boolean))
        );

        const { data: images, error: imgErr } = await supabase
          .from("images")
          .select("id, url")
          .in("id", imageIds);

        if (imgErr) throw imgErr;

        const urlById = new Map<string, string>();
        (images ?? []).forEach((im: any) => urlById.set(String(im.id), String(im.url)));

        const items: FeedItem[] = captions
          .map((c: any) => {
            const imageId = String(c.image_id);
            const imageUrl = urlById.get(imageId);
            if (!imageUrl) return null;
            return {
              imageId,
              imageUrl,
              captionId: String(c.id),
              captionText: String(c.text ?? ""),
            };
          })
          .filter(Boolean) as FeedItem[];

        setFeed(shuffle(items));
        setIdx(0);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  async function vote(v: 1 | -1) {
    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }
    if (!userId) {
      router.replace(`/login?next=/rate`);
      return;
    }
    if (!current) return;

    setError(null);

    try {
      // You may need to adapt column names to YOUR schema:
      // - if caption_votes has user_id + caption_id + vote_value, keep as below
      // - if it requires profile_id, you must supply it (then we’ll fetch it)
      const { error } = await supabase.from("caption_votes").insert({
        user_id: userId,
        caption_id: current.captionId,
        vote_value: v,
      });

      if (error) throw error;

      // Next item
      const nextIdx = idx + 1;
      if (nextIdx >= feed.length) {
        // reshuffle and restart
        setFeed((f) => shuffle(f));
        setIdx(0);
      } else {
        setIdx(nextIdx);
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
        <div>Loading…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, fontFamily: "system-ui" }}>
        <div style={{ color: "crimson", fontWeight: 800 }}>Error</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
      </main>
    );
  }

  if (!current) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
        <div>No captions/images found.</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "system-ui",
        background: "#f6f7f9",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 14 }}>
        <header
          style={{
            padding: 18,
            borderRadius: 18,
            background: "white",
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Rate captions</div>
            <div style={{ opacity: 0.7, marginTop: 4 }}>
              {idx + 1} / {feed.length}
            </div>
          </div>
          <button
            onClick={() => router.replace("/")}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Home
          </button>
        </header>

        <section
          style={{
            padding: 18,
            borderRadius: 18,
            background: "white",
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 16,
              overflow: "hidden",
              background: "#eee",
              display: "grid",
              placeItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt="meme"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ fontSize: 18, fontWeight: 900 }}>{current.captionText}</div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => vote(-1)}
              style={{
                width: 56,
                height: 44,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                cursor: "pointer",
                fontSize: 18,
              }}
              aria-label="downvote"
              title="downvote"
            >
              👎
            </button>
            <button
              onClick={() => vote(1)}
              style={{
                width: 56,
                height: 44,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                cursor: "pointer",
                fontSize: 18,
              }}
              aria-label="upvote"
              title="upvote"
            >
              👍
            </button>

            <button
              onClick={() => setIdx((i) => (i + 1 >= feed.length ? 0 : i + 1))}
              style={{
                marginLeft: "auto",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Skip →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
