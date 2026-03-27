import { createSupabaseServerClient } from "@/lib/supabase/server";
import Navbar from "../components/Navbar";
import RateClient from "./rate-client";
import { fetchCaptionsSafe } from "@/lib/fetchCaptions";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RatePage() {
  const supabase = await createSupabaseServerClient();

  const { items, error: capErr } = await fetchCaptionsSafe(supabase, 200);

  if (capErr) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <Navbar />
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 24,
            background: "#fff0f0",
            borderRadius: 12,
            border: "1px solid #fcc",
          }}
        >
          <div style={{ color: "crimson", fontWeight: 900, marginBottom: 8 }}>
            Error loading captions
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, marginBottom: 16 }}>
            {capErr}
          </pre>
          <Link
            href="/rate"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: 10,
              background: "#111",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Retry
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <RateClient items={items} />
    </>
  );
}
