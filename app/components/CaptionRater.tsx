"use client";

import { useMemo, useState } from "react";
import VoteButtons from "@/app/components/VoteButtons";

type Caption = {
  id: string;
  content: string;
  imageUrl?: string | null;
};

export default function CaptionRater({ captions }: { captions: Caption[] }) {
  const [idx, setIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const current = captions[idx];

  const progressText = useMemo(() => {
    if (!captions || captions.length === 0) return "0 / 0";
    return `${idx + 1} / ${captions.length}`;
  }, [idx, captions]);

  function next() {
    setImgFailed(false);
    setIdx((prev) => Math.min(prev + 1, captions.length));
  }

  if (!captions || captions.length === 0) {
    return <p style={{ marginTop: 12, color: "#666" }}>No captions found.</p>;
  }

  if (idx >= captions.length) {
    return (
      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>All done 🎉</h3>
        <p style={{ marginTop: 8, color: "#666" }}>You’ve rated all captions.</p>
        <button
          onClick={() => {
            setImgFailed(false);
            setIdx(0);
          }}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            cursor: "pointer",
          }}
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#666" }}>{progressText}</span>

        <button
          onClick={next}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Skip →
        </button>
      </div>

      <div
        style={{
          marginTop: 10,
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 14,
          padding: 16,
        }}
      >
        {/* IMAGE */}
        {current.imageUrl && !imgFailed ? (
          <img
            src={current.imageUrl}
            alt="Caption image"
            style={{
              width: "100%",
              maxHeight: 360,
              objectFit: "cover",
              borderRadius: 12,
              marginBottom: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#f2f2f2",
            }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            style={{
              height: 260,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.04)",
              display: "grid",
              placeItems: "center",
              marginBottom: 12,
              color: "#666",
              fontSize: 13,
            }}
          >
            Image unavailable
          </div>
        )}

        {/* Optional: show the URL for debugging (remove later) */}
        {imgFailed && (
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10, wordBreak: "break-all" }}>
            Failed URL: {String(current.imageUrl)}
          </div>
        )}

        {/* CAPTION TEXT */}
        <div style={{ fontSize: 18, lineHeight: 1.4 }}>{current.content}</div>

        {/* VOTE -> NEXT */}
        <VoteButtons captionId={current.id} disabled={false} onVoted={next} />
      </div>
    </div>
  );
}
