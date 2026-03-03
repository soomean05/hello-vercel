"use client";

import { useEffect, useMemo, useState } from "react";
import VoteButtons from "@/app/components/VoteButtons";

type Item = {
  id: string | number;
  content: string;
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

export default function RateClient({
  email,
  items,
}: {
  email: string;
  items: Item[];
}) {
  const randomized = useMemo(() => shuffle(items), [items]);
  const [idx, setIdx] = useState(0);

  const current = randomized[idx];

  useEffect(() => {
    setIdx(0);
  }, [items]);

  function next() {
    setIdx((p) => Math.min(p + 1, randomized.length));
  }

  if (!items || items.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ margin: 0 }}>Rate Captions</h1>
        <p style={{ marginTop: 8, color: "#666" }}>
          Signed in as <strong>{email}</strong>
        </p>
        <p style={{ marginTop: 16, color: "#666" }}>
          No captions available yet. Upload some images first.
        </p>
      </main>
    );
  }

  if (idx >= randomized.length) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ margin: 0 }}>Rate Captions</h1>
        <p style={{ marginTop: 8, color: "#666" }}>
          Signed in as <strong>{email}</strong>
        </p>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 14,
            background: "#fafafa",
          }}
        >
          <h2 style={{ margin: 0 }}>You’re done ✅</h2>
          <p style={{ marginTop: 8, color: "#666" }}>
            You rated everything in this batch.
          </p>

          <button
            onClick={() => setIdx(0)}
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#111",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Shuffle again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "system-ui",
        background: "linear-gradient(180deg, #f6f7f9 0%, #ffffff 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 760,
          background: "white",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 12px 36px rgba(0,0,0,0.09)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "grid",
          gap: 12,
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>Rate Captions</h1>
            <p style={{ marginTop: 6, color: "#666", marginBottom: 0 }}>
              Signed in as <strong>{email}</strong>
            </p>
          </div>
          <div style={{ color: "#666", fontSize: 13, paddingTop: 6 }}>
            {idx + 1} / {randomized.length}
          </div>
        </header>

        {current?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.imageUrl}
            alt="rating image"
            style={{
              width: "100%",
              maxHeight: 420,
              objectFit: "cover",
              borderRadius: 14,
              border: "1px solid #eee",
            }}
          />
        ) : (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px dashed #ddd",
              color: "#777",
              background: "#fafafa",
            }}
          >
            No image URL for this caption (check your DB column mapping).
          </div>
        )}

        <div
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid #eee",
            background: "#fafafa",
            lineHeight: 1.4,
            fontSize: 16,
          }}
        >
          {current.content}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <VoteButtons captionId={current.id} disabled={false} onVoted={next} />

          <button
            onClick={next}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Skip →
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#777" }}>
          Tip: voting automatically moves to the next item.
        </div>
      </section>
    </main>
  );
}
