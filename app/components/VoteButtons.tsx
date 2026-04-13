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
  const [error, setError] = useState<string | null>(null);

  async function handleVote(captionId: string, vote: 1 | -1) {
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption_id: captionId,
          vote,
        }),
      });

      const result = await res.json();
      console.log("vote response:", res.status, result);

      if (!res.ok) {
        alert(result.error || "Vote failed");
        return false;
      }

      console.log("Vote saved successfully");
      return true;
    } catch (err) {
      console.error("handleVote error:", err);
      alert("Vote failed");
      return false;
    }
  }

  async function submitVote(value: Vote) {
    if (disabled) return;

    setLoading(value);
    setError(null);

    try {
      const ok = await handleVote(String(captionId), value);
      if (!ok) {
        setError("Vote failed");
        return;
      }

      setSelected(value);
      onVoted?.();
      setSelected(null);
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
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {error && (
        <span style={{ fontSize: 13, color: "#c00" }}>{error}</span>
      )}
      <div style={{ display: "flex", gap: 12 }}>
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
    </div>
  );
}
