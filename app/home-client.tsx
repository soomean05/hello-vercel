"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

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
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

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

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const result = await supabase.auth.getSession();
        const session = result.data.session;
        const email = session?.user?.email ?? null;

        console.log("[homepage] session user email:", email);

        if (!mounted) return;
        setSessionEmail(email);
        setSessionReady(true);
      } catch (e) {
        console.log("[homepage] getSession error:", e);
        if (!mounted) return;
        setSessionEmail(null);
        setSessionReady(true);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const email = session?.user?.email ?? null;
      console.log("[homepage] auth state change:", event, "email:", email);
      if (!mounted) return;
      setSessionEmail(email);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (sessionReady && sessionEmail) {
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
      {sessionReady ? "Sign in with Google" : "Checking session…"}
    </button>
  );
}
