import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/rate");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #f8fafc 0%, #f1f5f9 45%, #e2e8f0 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#111827",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#111827",
            textDecoration: "none",
            letterSpacing: -0.6,
          }}
        >
          CaptionRater
        </Link>
        <HomeClient />
      </header>

      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "44px 32px 88px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.5rem, 6vw, 3.8rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -0.04,
          }}
        >
          Rate memes. Generate captions. Find the funniest.
        </h1>
        <p
          style={{
            marginTop: 20,
            fontSize: 19,
            lineHeight: 1.6,
            color: "#1f2937",
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          CaptionRater helps you discover and vote on AI-generated captions for memes.
          Upload an image, get 5 unique captions, and help the community decide what’s funny.
        </p>

        <div
          style={{
            marginTop: 46,
            padding: "32px 30px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
            textAlign: "left",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800, color: "#111827" }}>
            How it works
          </h2>
          <ol
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#374151",
              lineHeight: 1.9,
              fontSize: 15,
            }}
          >
            <li>
              <strong style={{ color: "#111827" }}>Sign in with Google</strong> — one click, no password.
            </li>
            <li>
              <strong style={{ color: "#111827" }}>Rate captions</strong> — see a meme and caption, give a thumbs up or down.
            </li>
            <li>
              <strong style={{ color: "#111827" }}>Upload & generate</strong> — upload your own image; our AI suggests 5 captions.
            </li>
            <li>
              <strong style={{ color: "#111827" }}>Improve the dataset</strong> — your votes train better models over time.
            </li>
          </ol>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: "24px 28px",
            background: "rgba(255,255,255,0.72)",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "#4b5563" }}>
            All features — rating and uploading — are in the app after you sign in.
            Get started below.
          </p>
        </div>
      </section>
    </main>
  );
}
