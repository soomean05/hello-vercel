"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const btnBase = {
  padding: "10px 20px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
} as const;

export default function HomeClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const handleSignIn = async () => {
    const origin =
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
        : "";
    const redirectTo = `${origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      style={{
        ...btnBase,
        background: "#fff",
        color: "#0f0f12",
        border: "none",
      }}
    >
      Sign in with Google
    </button>
  );
}
