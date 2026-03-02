export default function HomePage() {
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
          maxWidth: 900,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 22,
          alignItems: "center",
        }}
      >
        {/* LEFT: copy + buttons */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 12,
              color: "#333",
              marginBottom: 14,
            }}
          >
            <span>🧪</span>
            <span>Caption Pipeline Demo</span>
          </div>

          <h1 style={{ margin: 0, fontSize: 42, letterSpacing: -0.6, lineHeight: 1.05 }}>
            Upload an image.
            <br />
            Get captions instantly.
          </h1>

          <p style={{ marginTop: 14, fontSize: 16, color: "#444", lineHeight: 1.6 }}>
            This app uploads an image using a presigned URL, registers it with the pipeline,
            and generates multiple captions via the AlmostCrackd staging API.
          </p>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/protected"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 16px",
                borderRadius: 12,
                background: "black",
                color: "white",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 650,
              }}
            >
              Open pipeline →
            </a>

            <a
              href="/protected"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px 16px",
                borderRadius: 12,
                background: "white",
                color: "#111",
                border: "1px solid rgba(0,0,0,0.14)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 650,
              }}
            >
              Sign in
            </a>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: "#777" }}>
            Tip: If you’re not signed in, you’ll be prompted to log in first.
          </div>
        </div>

        {/* RIGHT: preview card (static) */}
        <div
          style={{
            background: "white",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#eee",
            }}
          >
            {/* Placeholder “image” so it doesn’t look empty */}
            <div
              style={{
                height: 260,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.10), rgba(0,0,0,0.02))",
              }}
            >
              <div style={{ textAlign: "center", color: "#222" }}>
                <div style={{ fontSize: 40 }}>🖼️</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                  Upload preview
                </div>
              </div>
            </div>

            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
                Example output:
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#fafafa",
                    border: "1px solid #eee",
                    fontSize: 14,
                    lineHeight: 1.35,
                  }}
                >
                  “When your coach says ‘relax’ mid-match and you instantly forget how to breathe.”
                </div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#fafafa",
                    border: "1px solid #eee",
                    fontSize: 14,
                    lineHeight: 1.35,
                  }}
                >
                  “POV: you’re locked in… until someone starts yelling advice from the stands.”
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                Static preview — real captions appear after upload.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
