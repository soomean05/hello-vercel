"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function sendLink() {
    setError(null);

    if (!supabase) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    if (!email) {
      setError("Enter your email.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      setSent(true);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>Magic link</div>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@columbia.edu"
        type="email"
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          outline: "none",
        }}
      />

      <button
        onClick={sendLink}
        disabled={busy}
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.15)",
          background: "white",
          fontWeight: 900,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Sending…" : "Send magic link"}
      </button>

      {sent ? (
        <div style={{ color: "green", fontWeight: 700 }}>
          Sent! Check your email.
        </div>
      ) : null}

      {error ? (
        <div style={{ color: "crimson", fontWeight: 700 }}>{error}</div>
      ) : null}
    </div>
  );
}
