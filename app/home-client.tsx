"use client";

import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

const btnBase = {
  padding: "10px 20px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
} as const;

export default function HomeClient({ email }: { email: string | null }) {
  const handleSignIn = async () => {
    const supabase = createBrowserClient();
    const origin =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        : "";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  };

  if (email) {
    return (
      <Link
        href="/app"
        style={{
          ...btnBase,
          background: "#fff",
          color: "#0f0f12",
          border: "none",
        }}
      >
        Go to app
      </Link>
    );
  }

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
