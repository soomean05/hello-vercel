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

export default function UploadClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [busy, setBusy] = useState(false);
  const [completedStep, setCompletedStep] = useState<Step>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [captions, setCaptions] = useState<any[]>([]);
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
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (!SUPPORTED.has(file.type)) {
      setError(`Unsupported type: ${file.type}`);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("No access token. Refresh.");
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };

    setBusy(true);
    setError(null);
    setCaptions([]);
    setGeneratedCaptions([]);
    setIsGenerating(true);
    setCompletedStep(null);

    try {
      setCompletedStep(1);
      const r1 = await fetch("/api/pipeline/generate-presigned-url", {
        method: "POST",
        headers,
        body: JSON.stringify({ contentType: file.type }),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok) throw new Error(j1.error || JSON.stringify(j1));

      const presignedUrl: string = j1.presignedUrl;
      const cdnUrlFromApi: string = j1.cdnUrl;

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
        headers,
        body: JSON.stringify({ imageUrl: cdnUrlFromApi, isCommonUse: false }),
      });
      const j3 = await r3.json().catch(() => ({}));
      if (!r3.ok) throw new Error(j3.error || JSON.stringify(j3));

      const imageIdFromApi: string = j3.imageId;

      setCompletedStep(4);
      const r4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers,
        body: JSON.stringify({ imageId: imageIdFromApi }),
      });
      const j4 = await r4.json().catch(() => ({}));
      if (!r4.ok) throw new Error(j4.error || JSON.stringify(j4));

      const raw = Array.isArray(j4) ? j4 : j4.captions ?? [];
      const normalized = raw
        .map((c: any) => c?.content ?? c?.text ?? c?.caption ?? null)
        .filter((c: any) => typeof c === "string" && c.trim().length > 0)
        .slice(0, 5);

      setGeneratedCaptions(normalized);
      setCaptions(raw);
    } catch (e: any) {
      setError(e.message ?? "Pipeline failed");
    } finally {
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
                  <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                    {file.name} · {file.type}
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: "#999", fontSize: 14 }}>Choose an image to preview</span>
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
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Generating 5 captions...</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                Please wait while we create caption suggestions for your uploaded image.
              </div>
            </div>
          )}

          {generatedCaptions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>Generated captions (5)</div>
              <div style={{ display: "grid", gap: 10 }}>
                {generatedCaptions.map((caption, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "#fafafa",
                      border: "1px solid #eee",
                      lineHeight: 1.4,
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
