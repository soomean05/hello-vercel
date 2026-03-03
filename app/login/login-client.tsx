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
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "system-ui", background: "#f6f7f9" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 14 }}>
        <header style={{ padding: 18, borderRadius: 18, background: "white", boxShadow: "0 10px 35px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Sign in</div>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Continue to: {next}</div>
        </header>

        <section style={{ padding: 18, borderRadius: 18, background: "white", boxShadow: "0 10px 35px rgba(0,0,0,0.08)", display: "grid", gap: 12 }}>
          {msg ? <div style={{ color: msg.includes("created") ? "green" : "crimson" }}>{msg}</div> : null}

          <button
            onClick={continueWithGoogle}
            disabled={busy}
            style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.15)", background: "white", fontWeight: 900, cursor: busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "Working…" : "Continue with Google"}
          </button>
        </section>
      </div>
    </main>
  );
}
