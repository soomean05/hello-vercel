"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type Step = 1 | 2 | 3 | 4 | null;

function stepIcon(completed: Step, active: Step, n: 1 | 2 | 3 | 4) {
  const done = completed !== null && completed >= n;
  const running = active === n;
  if (done) return "\u2705";
  if (running) return "\u2026";
  return "";
}

export default function UploadClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [busy, setBusy] = useState(false);
  const [activeStep, setActiveStep] = useState<Step>(null);
  const [completedStep, setCompletedStep] = useState<Step>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => null);
    router.replace("/");
  }

  async function runPipeline() {
    if (busy) return;
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
    setGeneratedCaptions([]);
    setIsGenerating(true);
    setCompletedStep(null);
    setActiveStep(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("No access token. Refresh.");
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      setActiveStep(1);
      const r1 = await fetch("/api/pipeline/generate-presigned-url", {
        method: "POST",
        headers,
        body: JSON.stringify({ contentType: file.type }),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok) throw new Error(j1.error || JSON.stringify(j1));

      const presignedUrl: string = j1.presignedUrl;
      const cdnUrlFromApi: string = j1.cdnUrl;
      setCompletedStep(1);

      setActiveStep(2);
      const r2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!r2.ok) throw new Error(await r2.text());
      setCompletedStep(2);

      setActiveStep(3);
      const r3 = await fetch("/api/pipeline/upload-image-from-url", {
        method: "POST",
        headers,
        body: JSON.stringify({ imageUrl: cdnUrlFromApi, isCommonUse: false }),
      });
      const j3 = await r3.json().catch(() => ({}));
      if (!r3.ok) throw new Error(j3.error || JSON.stringify(j3));

      const imageIdFromApi: string = j3.imageId;
      setCompletedStep(3);

      setActiveStep(4);
      const r4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers,
        body: JSON.stringify({ imageId: imageIdFromApi }),
      });
      const j4 = await r4.json().catch(() => ({}));
      if (!r4.ok) throw new Error(j4.error || JSON.stringify(j4));

      const raw = Array.isArray(j4) ? j4 : j4.captions ?? [];
      const normalized = raw
        .map((c: unknown) => {
          if (typeof c === "string") return c;
          if (!c || typeof c !== "object") return null;
          const o = c as Record<string, unknown>;
          const v = o.content ?? o.text ?? o.caption;
          return typeof v === "string" ? v : null;
        })
        .filter((c: string | null): c is string => typeof c === "string" && c.trim().length > 0)
        .slice(0, 5);

      setGeneratedCaptions(normalized);
      setCompletedStep(4);
    } catch (e: any) {
      setError(e.message ?? "Pipeline failed");
    } finally {
      setActiveStep(null);
      setIsGenerating(false);
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
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: 24,
        fontFamily: "system-ui",
        color: "#0f172a",
        WebkitFontSmoothing: "subpixel-antialiased",
      }}
    >
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
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Upload meme</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#1f2937", fontWeight: 500 }}>
              We&apos;ll generate captions via AlmostCrackd pipeline.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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
              const f = e.target.files?.[0] ?? null;
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setFile(f);
              setError(null);
              if (f) {
                const url = URL.createObjectURL(f);
                setPreviewUrl(url);
              } else {
                setPreviewUrl(null);
              }
            }}
            style={{ display: "none" }}
            disabled={busy}
          />

          {/* Preview area */}
          <div
            style={{
              marginBottom: 14,
              padding: 16,
              borderRadius: 12,
              background: previewUrl ? "white" : "#fafafa",
              border: previewUrl ? "1px solid #eee" : "2px dashed #ddd",
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 420,
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                />
                {file && (
                  <div style={{ marginTop: 10, fontSize: 14, color: "#1f2937", fontWeight: 500 }}>
                    {file.name} · {file.type}
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>Choose an image to preview</span>
            )}
          </div>

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
                color: "#0f172a",
              }}
            >
              Choose file
            </button>
            {file && (
              <span style={{ marginLeft: 12, fontSize: 14, color: "#1f2937", fontWeight: 500 }}>
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
              border: busy || !file ? "1px solid #d1d5db" : "none",
              background: busy || !file ? "#e5e7eb" : "#111827",
              color: busy || !file ? "#0f172a" : "#ffffff",
              fontWeight: 800,
              cursor: busy || !file ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            {isGenerating ? "Generating captions..." : "Generate Captions"}
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
            <div style={{ fontWeight: 800, marginBottom: 4, color: "#0f172a" }}>Status</div>
            <div style={{ color: "#1f2937", fontWeight: 500 }}>
              Step 1: presigned url {stepIcon(completedStep, activeStep, 1)}
            </div>
            <div style={{ color: "#1f2937", fontWeight: 500 }}>
              Step 2: uploaded bytes {stepIcon(completedStep, activeStep, 2)}
            </div>
            <div style={{ color: "#1f2937", fontWeight: 500 }}>
              Step 3: registered image {stepIcon(completedStep, activeStep, 3)}
            </div>
            <div style={{ color: "#1f2937", fontWeight: 500 }}>
              Step 4: generated captions {stepIcon(completedStep, activeStep, 4)}
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, color: "crimson", fontSize: 14 }}>{error}</div>
          )}

          {isGenerating && (
            <div
              style={{
                marginTop: 20,
                padding: "14px 18px",
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Generating 5 captions...</div>
              <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
                Please wait while we create caption suggestions for your uploaded image.
              </div>
            </div>
          )}

          {generatedCaptions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, marginBottom: 12, color: "#0f172a" }}>Generated captions (5)</div>
              <div style={{ display: "grid", gap: 10 }}>
                {generatedCaptions.map((caption, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      lineHeight: 1.45,
                      color: "#0f172a",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    {caption}
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
