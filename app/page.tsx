import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeClient from "./home-client";
import NavAuth from "./components/NavAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const email = user?.email ?? null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        fontFamily: "system-ui",
      }}
    >
      {/* Nav header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/"
          style={{ fontSize: 18, fontWeight: 900, color: "#111", textDecoration: "none" }}
        >
          CaptionRater
        </Link>
        <NavAuth signedIn={!!user} />
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
          alignItems: "center",
        }}
      >
        {/* Left: Branding + description */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 36, letterSpacing: -0.5, lineHeight: 1.1 }}>
            CaptionRater
          </h1>
          <p style={{ marginTop: 10, fontSize: 16, color: "#444", lineHeight: 1.5 }}>
            Upload memes, generate captions, and rate the funniest ones.
          </p>
          <ul style={{ marginTop: 16, paddingLeft: 20, color: "#444", lineHeight: 1.8 }}>
            <li>Sign in with Google</li>
            <li>Rate captions (👍 / 👎)</li>
            <li>Upload images → generate captions</li>
          </ul>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/list"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.14)",
                background: "white",
                color: "#111",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              DB Read Demo
            </Link>
            <Link
              href="/protected"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.14)",
                background: "white",
                color: "#111",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Protected
            </Link>
            <Link
              href="/rate"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                background: "black",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Rate captions
            </Link>
            <Link
              href="/upload"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.14)",
                background: "white",
                color: "#111",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Upload image
            </Link>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <HomeClient email={email} />
      </section>
    </main>
  );
}
