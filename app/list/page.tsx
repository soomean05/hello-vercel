import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCaptionsSafe } from "@/lib/fetchCaptions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ListPage() {
  const supabase = await createSupabaseServerClient();
  const { items: rows, error } = await fetchCaptionsSafe(supabase, 20);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Link href="/" style={{ fontSize: 18, fontWeight: 900, color: "#111", textDecoration: "none" }}>
          CaptionRater
        </Link>
        <Link
          href="/"
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Home
        </Link>
      </header>

      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Captions (DB Read Demo)</h1>

      {error && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#fff0f0",
            color: "#c00",
            marginBottom: 16,
          }}
        >
          Error: {error}
          <Link
            href="/list"
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

      {!error && rows.length === 0 && (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            background: "#f6f7f9",
            color: "#666",
          }}
        >
          No captions found.
        </div>
      )}

      {!error && rows.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          {rows.map((row, i) => (
            <div
              key={row.id ?? i}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{row.content}</p>
              {row.imageUrl && (
                <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#666" }}>
                  Image: {row.imageUrl}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
