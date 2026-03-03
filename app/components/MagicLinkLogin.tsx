"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <input
        type="email"
        placeholder="your-email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ddd",
          fontSize: 14,
        }}
      />

      <button
        onClick={sendMagicLink}
        style={{
          height: 44,
          borderRadius: 12,
          border: "none",
          background: "black",
          color: "white",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Email me a login link
      </button>

      {sent && (
        <div style={{ fontSize: 13, color: "#555" }}>
          Check your email and click the login link.
        </div>
      )}

      {error && (
        <div style={{ fontSize: 13, color: "crimson" }}>
          {error}
        </div>
      )}
    </div>
  );
}
