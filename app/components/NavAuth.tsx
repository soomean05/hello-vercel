"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const linkStyle = {
  padding: "8px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
  color: "#111",
  cursor: "pointer",
} as const;

export default function NavAuth({ signedIn }: { signedIn: boolean }) {
  const handleSignIn = async () => {
    const origin =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        : "";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  };

  if (signedIn) {
    return (
      <Link href="/api/auth/signout" style={linkStyle}>
        Sign out
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      style={{ ...linkStyle, border: "none", font: "inherit" }}
    >
      Sign in with Google
    </button>
  );
}
