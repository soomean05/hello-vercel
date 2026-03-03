// app/protected/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?next=/protected");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: "linear-gradient(180deg, #f6f7f9 0%, #ffffff 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          background: "white",
          borderRadius: 18,
          padding: 26,
          boxShadow: "0 12px 36px rgba(0,0,0,0.09)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Protected</h1>
        <p style={{ marginTop: 8, color: "#444" }}>
          You are logged in as <strong>{data.user.email ?? data.user.id}</strong>
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <a
            href="/rate"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 900,
              textDecoration: "none",
              color: "#111",
              display: "inline-block",
            }}
          >
            Go to /rate
          </a>
          <a
            href="/upload"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 900,
              textDecoration: "none",
              color: "#111",
              display: "inline-block",
            }}
          >
            Go to /upload
          </a>
          <a
            href="/login"
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 900,
              textDecoration: "none",
              color: "#111",
              display: "inline-block",
              opacity: 0.75,
            }}
          >
            Sign out (from /login)
          </a>
        </div>
      </section>
    </main>
  );
}
