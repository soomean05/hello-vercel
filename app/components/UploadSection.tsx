"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type Step = 1 | 2 | 3 | 4 | null;

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.06)",
};

export default function UploadSection() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [completedStep, setCompletedStep] = useState<Step>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runPipeline() {
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (!SUPPORTED.has(file.type)) {
      setError(`Unsupported type: ${file.type}. Use JPEG, PNG, WebP, GIF, or HEIC.`);
      return;
    }

    setBusy(true);
    setError(null);
    setCaptions([]);
    setCdnUrl(null);
    setCompletedStep(null);

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Not authenticated. Please sign in again.");
        setBusy(false);
        return;
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      setCompletedStep(1);
      const r1 = await fetch("/api/pipeline/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
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
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ imageUrl: cdnUrlFromApi, isCommonUse: false }),
      });
      const j3 = await r3.json().catch(() => ({}));
      if (!r3.ok) throw new Error(j3.error || JSON.stringify(j3));

      const imageIdFromApi: string = j3.imageId;

      setCompletedStep(4);
      const r4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ imageId: imageIdFromApi }),
      });
      const j4 = await r4.json().catch(() => ({}));
      if (!r4.ok) throw new Error(j4.error || JSON.stringify(j4));

      const list = Array.isArray(j4) ? j4 : j4.captions ?? [];
      const captionList = list.slice(0, 5);
      setCaptions(captionList);

      // Persist to DB so they appear in rate feed
      const textList = captionList.map((c: any) => c?.content ?? c?.text ?? c?.caption ?? (typeof c === "string" ? c : JSON.stringify(c)));
      if (textList.length > 0) {
        const saveRes = await fetch("/api/captions/save", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ imageUrl: cdnUrlFromApi, captions: textList }),
        });
        if (saveRes.ok) router.refresh();
      }
    } catch (e: any) {
      setError(e.message ?? "Pipeline failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={card}>
      <h2 style={{ margin: "0 0 16px 0", fontSize: 20, fontWeight: 800 }}>Upload & generate captions</h2>
      <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#666" }}>
        Upload an image and our AI will suggest 5 different captions.
      </p>

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

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
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
            fontSize: 14,
          }}
        >
          Choose file
        </button>
        {file && (
          <span style={{ alignSelf: "center", fontSize: 14, color: "#555" }}>{file.name}</span>
        )}
        <button
          type="button"
          onClick={runPipeline}
          disabled={busy || !file}
          style={{
            padding: "12px 20px",
            borderRadius: 14,
            border: "none",
            background: busy || !file ? "#ccc" : "#111",
            color: "white",
            fontWeight: 700,
            cursor: busy || !file ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {busy ? "Generating…" : "Generate 5 captions"}
        </button>
      </div>

      <div
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: "#fafafa",
          border: "1px solid #eee",
          fontSize: 14,
          display: "grid",
          gap: 6,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Status</div>
        <div>Step 1: presigned url {completedStep !== null && completedStep >= 1 ? "✅" : ""}</div>
        <div>Step 2: upload {completedStep !== null && completedStep >= 2 ? "✅" : ""}</div>
        <div>Step 3: register image {completedStep !== null && completedStep >= 3 ? "✅" : ""}</div>
        <div>Step 4: generate captions {completedStep !== null && completedStep >= 4 ? "✅" : ""}</div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, color: "#c00", fontSize: 14 }}>{error}</div>
      )}

      {cdnUrl && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Uploaded image</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cdnUrl}
            alt="Uploaded"
            style={{
              maxWidth: "100%",
              maxHeight: 280,
              borderRadius: 14,
              objectFit: "contain",
              border: "1px solid #eee",
            }}
          />
        </div>
      )}

      {captions.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>5 generated captions</div>
          <div style={{ display: "grid", gap: 10 }}>
            {captions.map((c: any, i: number) => (
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
                {c.content ?? c.text ?? c.caption ?? JSON.stringify(c)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
