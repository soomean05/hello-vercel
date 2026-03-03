"use client";

import { useEffect, useMemo, useState } from "react";
import VoteButtons from "./VoteButtons";

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

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.06)",
};

export default function RateSection({ items }: { items: Item[] }) {
  const randomized = useMemo(() => shuffle(items), [items]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [items]);

  const current = randomized[idx];

  function next() {
    setIdx((p) => Math.min(p + 1, randomized.length));
  }

  if (!items || items.length === 0) {
    return (
      <div style={card}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800 }}>Rate captions</h2>
        <p style={{ color: "#666", margin: 0 }}>No captions available yet. Upload an image below to generate some.</p>
      </div>
    );
  }

  if (idx >= randomized.length) {
    return (
      <div style={card}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800 }}>Rate captions</h2>
        <p style={{ margin: 0, color: "#666" }}>You rated everything in this batch.</p>
        <button
          onClick={() => setIdx(0)}
          style={{
            marginTop: 14,
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Shuffle again
        </button>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Rate captions</h2>
        <span style={{ color: "#666", fontSize: 14 }}>
          {idx + 1} / {randomized.length}
        </span>
      </div>

      {current?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.imageUrl}
          alt="Meme"
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: 14,
            border: "1px solid #eee",
            marginBottom: 14,
          }}
        />
      ) : (
        <div
          style={{
            padding: 40,
            borderRadius: 14,
            border: "1px dashed #ddd",
            color: "#777",
            background: "#fafafa",
            marginBottom: 14,
            aspectRatio: "16 / 9",
            display: "grid",
            placeItems: "center",
          }}
        >
          No image
        </div>
      )}

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, lineHeight: 1.4 }}>
        {current?.content}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <VoteButtons captionId={current!.id} disabled={false} onVoted={next} />
        <button
          onClick={next}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
