import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppClient from "./app-client";
import { fetchCaptionsSafe } from "@/lib/fetchCaptions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/");

  const { items, error: capErr } = await fetchCaptionsSafe(supabase, 200);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        fontFamily: "system-ui",
      }}
    >
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
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#111827",
            textDecoration: "none",
          }}
        >
          CaptionRater
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#4b5563" }}>
            {data.user.email ?? "Signed in"}
          </span>
          <Link
            href="/api/auth/signout"
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              color: "#111827",
            }}
          >
            Sign out
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {capErr && (
          <div
            style={{
              padding: 16,
              marginBottom: 16,
              background: "#fff0f0",
              borderRadius: 12,
              color: "#c00",
            }}
          >
            Error loading captions: {capErr}
            <Link
              href="/app"
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "8px 14px",
                borderRadius: 10,
                background: "#111",
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Retry
            </Link>
          </div>
        )}
        <AppClient items={capErr ? [] : items} />
      </div>
    </main>
  );
}
