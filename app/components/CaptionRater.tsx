"use client";

import { useMemo, useState } from "react";
import VoteButtons from "@/app/components/VoteButtons";

type Caption = {
  id: string;
  content: string;
};

export default function CaptionRater({
  captions,
}: {
  captions: Caption[];
}) {
  const [idx, setIdx] = useState(0);

  const current = captions[idx];

  const progressText = useMemo(() => {
    if (captions.length === 0) return "0 / 0";
    return `${idx + 1} / ${captions.length}`;
  }, [idx, captions.length]);

  function next() {
    setIdx((prev) => Math.min(prev + 1, captions.length));
  }

  if (!captions || captions.length === 0) {
    return <p style={{ marginTop: 12, color: "#666" }}>No captions found.</p>;
  }

  // If idx == captions.length, we're done
  if (idx >= captions.length) {
    return (
      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>All done 🎉</h3>
        <p style={{ marginTop: 8, color: "#666" }}>
          You’ve rated all captions.
        </p>
        <button
          onClick={() => setIdx(0)}
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
        <div style={{ fontSize: 18, lineHeight: 1.4 }}>{current.content}</div>

        {/* When vote succeeds, go next */}
        <VoteButtons captionId={current.id} disabled={false} onVoted={next} />
      </div>
    </div>
  );
}
