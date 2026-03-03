"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/rate";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace(next);
    })();
  }, [router, next]);

  async function submit() {
    setMsg(null);
    setBusy(true);

    try {
      if (!email || !password) throw new Error("Enter email and password.");

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setMsg(
        "Account created. If email confirmation is required, check your email. Otherwise you can sign in now."
      );
      setMode("signin");
    } catch (e: any) {
      setMsg(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, fontFamily: "system-ui", background: "#f6f7f9" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gap: 14 }}>
        <header
          style={{
            padding: 18,
            borderRadius: 18,
            background: "white",
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900 }}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </div>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Continue to: {next}</div>
        </header>

        <section
          style={{
            padding: 18,
            borderRadius: 18,
            background: "white",
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            display: "grid",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Email</div>
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
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
              }}
            />
          </label>

          {msg ? <div style={{ color: msg.includes("created") ? "green" : "crimson" }}>{msg}</div> : null}

          <button
            onClick={submit}
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
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>

          <button
            onClick={() => {
              setMsg(null);
              setMode((m) => (m === "signin" ? "signup" : "signin"));
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
