"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`; // EXACT
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: "#f6f7f9",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.3 }}>Login</h1>
        <p style={{ marginTop: 10, marginBottom: 18, color: "#444", lineHeight: 1.4 }}>
          You must sign in to access the protected page.
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#111",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>

        <p style={{ marginTop: 14, fontSize: 12, color: "#666" }}>
          Redirect URI: <code>/auth/callback</code>
        </p>
      </section>
    </main>
  );
}

