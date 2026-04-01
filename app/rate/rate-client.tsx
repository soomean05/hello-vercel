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
  items,
}: {
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
    borderRadius: 20,
    padding: "18px 22px",
    boxShadow: "0 14px 38px rgba(15,23,42,0.08)",
    border: "1px solid rgba(15,23,42,0.08)",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  };
  const navBtn: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    fontWeight: 800,
    textDecoration: "none",
    color: "#111827",
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
  };
  const mainCard: React.CSSProperties = {
    background: "white",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 16px 44px rgba(15,23,42,0.09)",
    border: "1px solid rgba(15,23,42,0.08)",
  };

  if (!items || items.length === 0) {
    return (
      <main style={{ padding: 28, fontFamily: "system-ui", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Rate captions</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/upload" style={navBtn}>Upload</a>
          </div>
        </div>
        <div style={{ ...mainCard, padding: 30 }}>
          <p style={{ color: "#374151", margin: 0 }}>No captions available yet. Upload some images first.</p>
        </div>
        </div>
      </main>
    );
  }

  if (idx >= randomized.length) {
    return (
      <main style={{ padding: 28, fontFamily: "system-ui", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Rate captions</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="/upload" style={navBtn}>Upload</a>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 16,
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 16,
            background: "#fafafa",
          }}
        >
          <h2 style={{ margin: 0 }}>You’re done ✅</h2>
          <p style={{ marginTop: 8, color: "#374151" }}>
            You rated everything in this batch.
          </p>

          <button
            onClick={() => setIdx(0)}
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "#0f172a",
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
    <main style={{ padding: 28, fontFamily: "system-ui", background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={headerCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 21, color: "#111827" }}>Rate captions</span>
            <span style={{ color: "#4b5563", fontSize: 14 }}>
              {idx + 1} / {randomized.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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
              borderRadius: 16,
              border: "1px solid rgba(15,23,42,0.09)",
              marginBottom: 14,
            }}
          />
        ) : (
          <div
            style={{
              padding: 40,
              borderRadius: 16,
              border: "1px dashed rgba(15,23,42,0.18)",
              color: "#4b5563",
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

        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, lineHeight: 1.35, color: "#111827" }}>
          {current.content}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <VoteButtons
            captionId={current.id}
            disabled={false}
            onVoted={next}
          />
          <button
            onClick={next}
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
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
