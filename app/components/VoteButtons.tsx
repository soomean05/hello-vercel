"use client";

import { useState } from "react";
import { getAuthToken } from "@/app/lib/getAuthToken";

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

  async function submitVote(value: Vote) {
    if (disabled) return;

    setLoading(value);
    setError(null);

    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/vote", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ captionId, direction: value === 1 ? "up" : "down" }),
      });

      if (res.ok) {
        setSelected(value);
        // small delay so user sees feedback, then advance
        setTimeout(() => {
          onVoted?.();
          setSelected(null);
        }, 250);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Vote failed");
      }
    } catch {
      setError("Vote failed");
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
