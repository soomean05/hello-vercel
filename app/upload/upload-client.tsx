"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type Step = 1 | 2 | 3 | 4 | null;

export default function UploadClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [completedStep, setCompletedStep] = useState<Step>(null);
  const [file, setFile] = useState<File | null>(null);

  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => null);
    router.replace("/login");
  }

  async function runPipeline() {
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (!SUPPORTED.has(file.type)) {
      setError(`Unsupported type: ${file.type}`);
      return;
    }

    setBusy(true);
    setError(null);
    setCaptions([]);
    setCdnUrl(null);
    setImageId(null);
    setCompletedStep(null);

    try {
      setCompletedStep(1);
      const r1 = await fetch("/api/pipeline/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok) throw new Error(j1.error || JSON.stringify(j1));

      const presignedUrl: string = j1.presignedUrl;
      const cdnUrlFromApi: string = j1.cdnUrl;
      setCdnUrl(cdnUrlFromApi);

      setCompletedStep(2);
      const r2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!r2.ok) throw new Error(await r2.text());

      setCompletedStep(3);
      const r3 = await fetch("/api/pipeline/upload-image-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cdnUrlFromApi, isCommonUse: false }),
      });
      const j3 = await r3.json().catch(() => ({}));
      if (!r3.ok) throw new Error(j3.error || JSON.stringify(j3));

      const imageIdFromApi: string = j3.imageId;
      setImageId(imageIdFromApi);

      setCompletedStep(4);
      const r4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: imageIdFromApi }),
      });
      const j4 = await r4.json().catch(() => ({}));
      if (!r4.ok) throw new Error(j4.error || JSON.stringify(j4));

      setCaptions(Array.isArray(j4) ? j4 : j4.captions ?? []);
    } catch (e: any) {
      setError(e.message ?? "Pipeline failed");
    } finally {
      setBusy(false);
    }
  }

  const card: React.CSSProperties = {
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  };
  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7f9", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header card */}
        <div
          style={{
            ...card,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Upload meme</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
              We'll generate captions via AlmostCrackd pipeline.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" style={btn}>Home</Link>
            <Link href="/rate" style={btn}>Rate</Link>
            <button type="button" onClick={signOut} style={btn}>
              Sign out
            </button>
          </div>
        </div>

        {/* Main card */}
        <div style={card}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
            style={{ display: "none" }}
            disabled={busy}
          />

          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                fontWeight: 700,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              Choose file
            </button>
            {file && (
              <span style={{ marginLeft: 12, fontSize: 14, color: "#555" }}>
                {file.name}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={runPipeline}
            disabled={busy || !file}
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              border: "none",
              background: busy || !file ? "#ccc" : "black",
              color: "white",
              fontWeight: 800,
              cursor: busy || !file ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            Upload & Generate
          </button>

          {/* Step tracker */}
          <div
            style={{
              marginTop: 20,
              padding: "14px 18px",
              borderRadius: 14,
              background: "#fafafa",
              border: "1px solid #eee",
              fontSize: 14,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Status</div>
            <div>
              Step 1: presigned url {completedStep !== null && completedStep >= 1 ? "✅" : ""}
            </div>
            <div>
              Step 2: uploaded bytes {completedStep !== null && completedStep >= 2 ? "✅" : ""}
            </div>
            <div>
              Step 3: registered image {completedStep !== null && completedStep >= 3 ? "✅" : ""}
            </div>
            <div>
              Step 4: generated captions {completedStep !== null && completedStep >= 4 ? "✅" : ""}
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, color: "crimson", fontSize: 14 }}>{error}</div>
          )}

          {/* Results */}
          {cdnUrl && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Uploaded image</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cdnUrl}
                alt="Uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: 320,
                  borderRadius: 14,
                  objectFit: "contain",
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}

          {captions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>Generated captions</div>
              <div style={{ display: "grid", gap: 10 }}>
                {captions.slice(0, 10).map((c: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "#fafafa",
                      border: "1px solid #eee",
                      lineHeight: 1.4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span>{c.content ?? c.text ?? c.caption ?? JSON.stringify(c)}</span>
                    <Link
                      href="/rate"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        color: "#111",
                        flexShrink: 0,
                      }}
                    >
                      Rate this
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
