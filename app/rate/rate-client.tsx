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

  const headerCard: React.CSSProperties = {
    background: "white",
    borderRadius: 18,
    padding: "16px 20px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  };
  const navBtn: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    fontWeight: 700,
    textDecoration: "none",
    color: "#111",
    fontSize: 14,
  };
  const mainCard: React.CSSProperties = {
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  };

  if (!items || items.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui", background: "#f6f7f9", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Rate captions</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/" style={navBtn}>Home</a>
            <a href="/upload" style={navBtn}>Upload</a>
          </div>
        </div>
        <div style={{ ...mainCard, padding: 28 }}>
          <p style={{ color: "#666", margin: 0 }}>No captions available yet. Upload some images first.</p>
        </div>
        </div>
      </main>
    );
  }

  if (idx >= randomized.length) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui", background: "#f6f7f9", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Rate captions</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/" style={navBtn}>Home</a>
            <a href="/upload" style={navBtn}>Upload</a>
          </div>
        </div>
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
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", background: "#f6f7f9", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 20 }}>Rate captions</span>
            <span style={{ color: "#666", fontSize: 14 }}>
              {idx + 1} / {randomized.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/" style={navBtn}>Home</a>
            <a href="/upload" style={navBtn}>Upload</a>
          </div>
        </div>

        <div style={mainCard}>
        {current?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.imageUrl}
            alt="rating image"
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

        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14, lineHeight: 1.4 }}>
          {current.content}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <VoteButtons captionId={current.id} disabled={false} onVoted={next} />
          <button
            onClick={next}
            style={{
              marginLeft: "auto",
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
        </div>
      </div>
    </main>
  );
}
