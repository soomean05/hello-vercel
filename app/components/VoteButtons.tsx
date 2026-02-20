"use client";

import { useState } from "react";

type Vote = 1 | -1;

export default function VoteButtons({
  captionId,
  disabled,
  onVoted,
}: {
  captionId: string | number;
  disabled: boolean;
  onVoted?: () => void;
}) {
  const [loading, setLoading] = useState<Vote | null>(null);
  const [selected, setSelected] = useState<Vote | null>(null);

  async function submitVote(value: Vote) {
    if (disabled) return;

    setLoading(value);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption_id: captionId, vote: value }),
      });

      if (res.ok) {
        setSelected(value);
        // small delay so user sees feedback, then advance
        setTimeout(() => {
          onVoted?.();
          setSelected(null);
        }, 250);
      }
    } finally {
      setLoading(null);
    }
  }

  const buttonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    fontSize: 18,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const selectedStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.2)",
  };

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
      <button
        type="button"
        onClick={() => submitVote(1)}
        disabled={disabled || loading !== null}
        style={{ ...buttonStyle, ...(selected === 1 ? selectedStyle : {}) }}
        aria-label="Upvote"
      >
        👍
      </button>

      <button
        type="button"
        onClick={() => submitVote(-1)}
        disabled={disabled || loading !== null}
        style={{ ...buttonStyle, ...(selected === -1 ? selectedStyle : {}) }}
        aria-label="Downvote"
      >
        👎
      </button>
    </div>
  );
}
