import Link from "next/link";
import HomeClient from "./home-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f0f12 0%, #1a1a1f 50%, #0f0f12 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e4e4e7",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 32px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            textDecoration: "none",
            letterSpacing: -0.5,
          }}
        >
          CaptionRater
        </Link>
        <HomeClient />
      </header>

      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 32px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -0.03,
          }}
        >
          Rate memes. Generate captions. Find the funniest.
        </h1>
        <p
          style={{
            marginTop: 24,
            fontSize: 18,
            lineHeight: 1.6,
            color: "#a1a1aa",
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          CaptionRater helps you discover and vote on AI-generated captions for memes.
          Upload an image, get 5 unique captions, and help the community decide what’s funny.
        </p>

        <div
          style={{
            marginTop: 48,
            padding: "32px 28px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "#fff" }}>
            How it works
          </h2>
          <ol
            style={{
              margin: 0,
              paddingLeft: 20,
              color: "#a1a1aa",
              lineHeight: 2,
              fontSize: 15,
            }}
          >
            <li>
              <strong style={{ color: "#e4e4e7" }}>Sign in with Google</strong> — one click, no password.
            </li>
            <li>
              <strong style={{ color: "#e4e4e7" }}>Rate captions</strong> — see a meme and caption, give a thumbs up or down.
            </li>
            <li>
              <strong style={{ color: "#e4e4e7" }}>Upload & generate</strong> — upload your own image; our AI suggests 5 captions.
            </li>
            <li>
              <strong style={{ color: "#e4e4e7" }}>Improve the dataset</strong> — your votes train better models over time.
            </li>
          </ol>
        </div>

        <div
          style={{
            marginTop: 40,
            padding: "24px 28px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "#71717a" }}>
            All features — rating and uploading — are in the app after you sign in.
            Get started below.
          </p>
        </div>
      </section>
    </main>
  );
}
