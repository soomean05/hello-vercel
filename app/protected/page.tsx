// app/protected/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Navbar from "../components/Navbar";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui",
        background: "#f6f7f9",
      }}
    >
      <Navbar />
      <section
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: 24,
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
        <h1 style={{ margin: 0, fontSize: 28 }}>You're signed in</h1>
        <p style={{ marginTop: 8, color: "#374151" }}>
          <strong>{data.user.email ?? data.user.id}</strong>
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#4b5563" }}>
          User ID: {data.user.id}
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <a
            href="/rate"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 900,
              textDecoration: "none",
              color: "#111827",
              display: "inline-block",
            }}
          >
            Go to Rate
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
              color: "#111827",
              display: "inline-block",
            }}
          >
            Go to Upload
          </a>
        </div>
      </section>
      </section>
    </main>
  );
}
