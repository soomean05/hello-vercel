import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CaptionRow = Record<string, unknown> & { id?: string; text?: string; image_id?: string };

export default async function ListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("captions")
    .select("*")
    .limit(20);

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
          Error: {error.message}
        </div>
      )}

      {!error && (!rows || rows.length === 0) && (
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

      {!error && rows && rows.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          {(rows as CaptionRow[]).map((row, i) => (
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
              {row.text != null && (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{String(row.text)}</p>
              )}
              <pre
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 12,
                  color: "#666",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(row, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
