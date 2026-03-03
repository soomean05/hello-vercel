"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginClient({ next }: { next: string }) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace(next);
    })();
  }, [router, next]);

  async function continueWithGoogle() {
    setMsg(null);
    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "system-ui", background: "#f6f7f9", display: "grid", placeItems: "center" }}>
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          padding: 28,
          borderRadius: 18,
          background: "white",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "grid",
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Sign in</h1>
        {msg ? <div style={{ color: "crimson", fontSize: 14 }}>{msg}</div> : null}
        <button
          onClick={continueWithGoogle}
          disabled={busy}
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            fontWeight: 800,
            fontSize: 16,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Working…" : "Continue with Google"}
        </button>
        <p style={{ margin: 0, fontSize: 11, color: "#999" }}>
          Redirects to /auth/callback
        </p>
      </div>
    </main>
  );
}
