"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState<Vote | null>(null);
  const [selected, setSelected] = useState<Vote | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitVote(value: Vote) {
    if (disabled) return;

    setLoading(value);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        alert("You must be logged in to vote.");
        setError("You must be logged in to vote.");
        return;
      }

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption_id: captionId,
          vote: value,
        }),
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
