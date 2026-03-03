"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FeedItem = {
  captionId: string;
  captionText: string;
  imageId: string;
  imageUrl: string | null;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Finds the current user's profile_id WITHOUT needing profiles.user_id.
 *
 * Strategy:
 * - If captions table has both profile_id and user_id, use that (fast).
 * - Else fallback to caption_votes (if the user has voted before).
 *
 * If BOTH are empty for the user, there is no way to derive profile_id from the client
 * with your current schema (no mapping column). In that case, you must ask course staff
 * what table/claim maps auth user -> profiles.id.
 */
async function getMyProfileIdOrThrow(userId: string): Promise<string> {
  // 1) Try from captions (you showed captions has profile_id FK)
  const fromCaptions = await supabase
    .from("captions")
    .select("profile_id")
    .eq("user_id", userId) // if captions has user_id
    .order("created_datetime_utc", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!fromCaptions.error && fromCaptions.data?.profile_id) {
    return String(fromCaptions.data.profile_id);
  }

  // 2) Try from caption_votes (you showed caption_votes has user_id)
  const fromVotes = await supabase
    .from("caption_votes")
    .select("profile_id")
    .eq("user_id", userId)
    .order("created_datetime_utc", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fromVotes.error) throw fromVotes.error;
  if (fromVotes.data?.profile_id) return String(fromVotes.data.profile_id);

  throw new Error(
    "Could not determine your profile_id. Your schema has no auth-user -> profiles mapping column, and you have no existing rows (captions/votes) that include both user_id and profile_id."
  );
}

export default function RatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [busyVote, setBusyVote] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [idx, setIdx] = useState(0);

  const [cachedProfileId, setCachedProfileId] = useState<string | null>(null);

  const current = useMemo(() => items[idx] ?? null, [items, idx]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      await loadFeed();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFeed() {
    setLoading(true);

    const { data, error } = await supabase
      .from("captions")
      .select("id, content, image_id, images(url)")
      .limit(200);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const feed: FeedItem[] = (data ?? []).map((row: any) => ({
      captionId: row.id,
      captionText: row.content, // ✅ captions.content per your schema
      imageId: row.image_id,
      imageUrl: row.images?.url ?? null, // ✅ images.url per your schema
    }));

    setItems(shuffle(feed));
    setIdx(0);
    setLoading(false);
  }

  async function vote(voteValue: 1 | -1) {
    if (!current) return;
    setBusyVote(true);

    try {
      const { data: u, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;

      const userId = u.user?.id;
      if (!userId) {
        router.replace("/");
        return;
      }

      // ✅ determine profile_id once, cache it
      let profileId = cachedProfileId;
      if (!profileId) {
        profileId = await getMyProfileIdOrThrow(userId);
        setCachedProfileId(profileId);
      }

      const nowIso = new Date().toISOString();

      // ✅ Upsert lets user change vote without duplicates
      const { error } = await supabase.from("caption_votes").upsert(
        {
          user_id: userId,
          profile_id: profileId,
          caption_id: current.captionId,
          vote_value: voteValue,
          created_datetime_utc: nowIso,
          modified_datetime_utc: nowIso,
        },
        { onConflict: "user_id,caption_id" }
      );

      if (error) throw error;

      setIdx((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Vote failed");
    } finally {
      setBusyVote(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: 14 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 20 }}>Rate</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => router.push("/upload")} style={btnStyle}>
              Go to Upload
            </button>
            <button onClick={() => router.push("/dashboard")} style={btnStyle}>
              Dashboard
            </button>
            <button onClick={loadFeed} style={btnStyle}>
              Refresh
            </button>
            <button onClick={signOut} style={btnStyle}>
              Sign out
            </button>
          </div>
        </header>

        <section style={cardStyle}>
          {loading ? (
            <div style={{ opacity: 0.7 }}>Loading…</div>
          ) : !current ? (
            <div style={{ opacity: 0.7 }}>No captions found.</div>
          ) : (
            <>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                {current.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.imageUrl}
                    alt="meme"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ color: "white", padding: 16 }}>No image url</div>
                )}
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: 18,
                  fontWeight: 850,
                }}
              >
                {current.captionText}
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <button
                  onClick={() => vote(-1)}
                  disabled={busyVote}
                  style={voteBtnStyle}
                >
                  👎
                </button>
                <button
                  onClick={() => vote(1)}
                  disabled={busyVote}
                  style={voteBtnStyle}
                >
                  👍
                </button>
              </div>

              <div style={{ opacity: 0.6, fontSize: 13 }}>
                Item {idx + 1} / {items.length}
              </div>

              <div style={{ opacity: 0.55, fontSize: 12 }}>
                profile_id: {cachedProfileId ?? "(not loaded yet)"}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 14,
};

const voteBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "white",
  fontSize: 18,
  cursor: "pointer",
};
