"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type CaptionItem = any;

function extractCaptionText(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  // Most likely field per your screenshot
  if (typeof c.content === "string") return c.content;
  // Fallbacks
  if (typeof c.caption === "string") return c.caption;
  if (typeof c.text === "string") return c.text;
  return JSON.stringify(c);
}

export default function UploadAndCaption() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const [cdnUrl, setCdnUrl] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");
  const [captions, setCaptions] = useState<CaptionItem[] | null>(null);

  const localPreview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  async function run() {
    if (!file) return;

    if (!SUPPORTED.has(file.type)) {
      setStatus(`Error: Unsupported file type "${file.type}"`);
      return;
    }

    setBusy(true);
    setStatus("Step 1/4: Generating presigned URL...");
    setCaptions(null);
    setCdnUrl("");
    setImageId("");

    try {
      // STEP 1
      const s1 = await fetch("/api/pipeline/generate-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      const s1json = await s1.json();
      if (!s1.ok) throw new Error(s1json?.error ?? JSON.stringify(s1json));

      const presignedUrl = s1json?.presignedUrl;
      const returnedCdnUrl = s1json?.cdnUrl;
      if (!presignedUrl || !returnedCdnUrl) {
        throw new Error("Step 1 response missing presignedUrl/cdnUrl");
      }

      // STEP 2
      setStatus("Step 2/4: Uploading bytes to storage...");
      const put = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`Step 2 upload failed: HTTP ${put.status}`);

      // STEP 3
      setStatus("Step 3/4: Registering uploaded image...");
      const s3 = await fetch("/api/pipeline/register-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: returnedCdnUrl, isCommonUse: false }),
      });

      const s3json = await s3.json();
      if (!s3.ok) throw new Error(s3json?.error ?? JSON.stringify(s3json));

      const newImageId = s3json?.imageId;
      if (!newImageId) throw new Error("Step 3 response missing imageId");

      setCdnUrl(returnedCdnUrl);
      setImageId(newImageId);

      // STEP 4
      setStatus("Step 4/4: Generating captions...");
      const s4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: newImageId }),
      });

      const s4json = await s4.json();
      if (!s4.ok) throw new Error(s4json?.error ?? JSON.stringify(s4json));

      const list = Array.isArray(s4json) ? s4json : s4json?.captions;
      setCaptions(
        Array.isArray(list)
          ? list
          : Array.isArray(s4json)
          ? s4json
          : [s4json]
      );

      setStatus("Done ✅");
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? "Unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontWeight: 600 }}>Upload an image</label>

        {/* Hidden native file input */}
        <input
          id="file-input"
          type="file"
          accept={ACCEPT}
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={busy}
        />

        {/* Custom choose button */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById(
                "file-input"
              ) as HTMLInputElement;
              el?.click();
            }}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: busy ? "#ddd" : "white",
              color: "#111",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Choose Image
          </button>

          <span style={{ fontSize: 14, color: "#444" }}>
            {file ? file.name : "No file selected"}
          </span>
        </div>

        <small style={{ color: "#666" }}>
          Supported: jpeg/jpg/png/webp/gif/heic
        </small>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={run}
          disabled={!file || busy}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: !file || busy ? "#ccc" : "#111",
            color: "white",
            cursor: !file || busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Working..." : "Upload + Generate Captions"}
        </button>

        <div style={{ color: "#444" }}>{status}</div>
      </div>

      {(localPreview || cdnUrl) && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {localPreview && (
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                Local preview
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localPreview}
                alt="local preview"
                style={{
                  width: 260,
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}

          {cdnUrl && (
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                CDN preview
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cdnUrl}
                alt="cdn preview"
                style={{
                  width: 260,
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
            </div>
          )}
        </div>
      )}

      {imageId && (
        <div style={{ fontSize: 12, color: "#666" }}>
          imageId: <code>{imageId}</code>
        </div>
      )}

      {captions && (
        <div style={{ marginTop: 6 }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: 18 }}>Captions</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {captions.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: "#fafafa",
                  lineHeight: 1.4,
                }}
              >
                {extractCaptionText(c)}
              </div>
            ))}
          </div>

          {/* ✅ NEW: navigation to ratings */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => router.push("/protected")}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                background: "#222",
                color: "white",
                cursor: "pointer",
              }}
            >
              Go Rate Captions →
            </button>

            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              If you don’t see your captions there, your Ratings page may be using
              a separate caption pool.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
