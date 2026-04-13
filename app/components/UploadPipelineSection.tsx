"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PipelineState =
  | "idle"
  | "getting_url"
  | "uploading_bytes"
  | "registering"
  | "generating"
  | "done"
  | "error";

function prettyState(s: PipelineState) {
  switch (s) {
    case "idle":
      return "Idle";
    case "getting_url":
      return "Step 1: Generating presigned URL…";
    case "uploading_bytes":
      return "Step 2: Uploading image bytes…";
    case "registering":
      return "Step 3: Registering image…";
    case "generating":
      return "Step 4: Generating captions…";
    case "done":
      return "Done ✅";
    case "error":
      return "Error";
  }
}

export default function UploadPipelineSection() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<PipelineState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[] | null>(null);
   const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const pipelineLock = useRef(false);

  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return `${file.name} (${Math.round(file.size / 1024)} KB, ${file.type || "unknown type"})`;
  }, [file]);

  async function runPipeline() {
    if (pipelineLock.current) return;
    setError(null);
    setCdnUrl(null);
    setImageId(null);
    setCaptions(null);

    if (!file) {
      setError("Pick an image file first.");
      return;
    }

    // Validate type (assignment supported list)
    const supported = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ]);
    if (file.type && !supported.has(file.type)) {
      setError(`Unsupported file type: ${file.type}`);
      return;
    }

    pipelineLock.current = true;
    try {
      // STEP 1: presigned URL
      setState("getting_url");
      const s1 = await fetch(`/api/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // If file.type is empty, default to jpeg
          contentType: file.type || "image/jpeg",
        }),
      });

      if (s1.status === 401) {
        throw new Error("Not logged in. Please sign in and try again.");
      }
      if (!s1.ok) {
        const txt = await s1.text();
        throw new Error(`Step 1 failed (${s1.status}): ${txt}`);
      }

      const { presignedUrl, cdnUrl: returnedCdnUrl } = await s1.json();
      if (!presignedUrl || !returnedCdnUrl) {
        throw new Error("Step 1 response missing presignedUrl or cdnUrl.");
      }
      setCdnUrl(returnedCdnUrl);

      // STEP 2: upload bytes to presignedUrl (PUT)
      setState("uploading_bytes");
      const s2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (!s2.ok) {
        const txt = await s2.text().catch(() => "");
        throw new Error(`Step 2 failed (${s2.status}): ${txt}`);
      }

      // STEP 3: register image URL
      setState("registering");
      const s3 = await fetch(`/api/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: returnedCdnUrl,
          isCommonUse: false,
        }),
      });

      if (s3.status === 401) {
        throw new Error("Not logged in. Please sign in and try again.");
      }
      if (!s3.ok) {
        const txt = await s3.text();
        throw new Error(`Step 3 failed (${s3.status}): ${txt}`);
      }

      const s3json = await s3.json();
      const newImageId = s3json?.imageId;
      if (!newImageId) throw new Error("Step 3 response missing imageId.");
      setImageId(newImageId);

      // STEP 4: generate captions
      setState("generating");
      const s4 = await fetch(`/api/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: newImageId }),
      });

      if (s4.status === 401) {
        throw new Error("Not logged in. Please sign in and try again.");
      }
      if (!s4.ok) {
        const txt = await s4.text();
        throw new Error(`Step 4 failed (${s4.status}): ${txt}`);
      }

      const captionsArr = await s4.json();
      setCaptions(Array.isArray(captionsArr) ? captionsArr : [captionsArr]);

      setState("done");
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? String(e));
    } finally {
      pipelineLock.current = false;
    }
  }

  return (
    <section
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 18,
        background: "white",
        boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>Upload → Generate captions (Pipeline)</div>
      <div style={{ marginTop: 6, opacity: 0.75, lineHeight: 1.4, color: "#374151" }}>
        This runs the 4-step pipeline against{" "}
        <code style={{ color: "#111827" }}>https://api.almostcrackd.ai</code> using your
        current signed-in JWT.
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {fileInfo ? <div style={{ opacity: 0.8, color: "#374151" }}>{fileInfo}</div> : null}

        {localPreviewUrl ? (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#111827" }}>Local preview</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreviewUrl}
              alt=""
              style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 14, objectFit: "contain" }}
            />
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={runPipeline}
            disabled={!file || ["getting_url", "uploading_bytes", "registering", "generating"].includes(state)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "black",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              opacity: !file ? 0.5 : 1,
            }}
          >
            Run pipeline
          </button>

          <div style={{ opacity: 0.8, color: "#374151" }}>{prettyState(state)}</div>
        </div>

        {error ? (
          <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
            {error}
            {error.toLowerCase().includes("not logged in") ? (
              <div style={{ marginTop: 8 }}>
                <a href="/login?next=/upload" style={{ fontWeight: 900, textDecoration: "underline", color: "crimson" }}>
                  Sign in →
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {cdnUrl ? (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800, color: "#111827" }}>Uploaded image preview</div>
            <img
              src={cdnUrl}
              alt="Uploaded"
              style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 14, objectFit: "contain" }}
            />
            <div style={{ opacity: 0.7, fontSize: 13, color: "#374151" }}>
              cdnUrl: <code>{cdnUrl}</code>
            </div>
          </div>
        ) : null}

        {imageId ? (
          <div style={{ opacity: 0.8, color: "#374151" }}>
            imageId: <code>{imageId}</code>
          </div>
        ) : null}

        {captions ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900, marginBottom: 8, color: "#111827" }}>Generated captions</div>

            <div style={{ display: "grid", gap: 8 }}>
              {captions.map((c, i) => {
                // Try common fields; fall back to JSON
                const text =
                  c?.text ?? c?.content ?? c?.caption ?? c?.caption_text ?? c?.value ?? null;

                return (
                  <div
                    key={c?.id ?? i}
                    style={{
                      border: "1px solid rgba(0,0,0,0.10)",
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ lineHeight: 1.35, color: "#111827" }}>
                      {text ? String(text) : <code>{JSON.stringify(c)}</code>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
