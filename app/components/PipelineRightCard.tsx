"use client";

import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Stage = "idle" | "s1" | "s2" | "s3" | "s4" | "done" | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Ready",
  s1: "1/4 Presigned URL",
  s2: "2/4 Upload bytes",
  s3: "3/4 Register image",
  s4: "4/4 Generate captions",
  done: "Done",
  error: "Error",
};

function isBusy(stage: Stage) {
  return stage === "s1" || stage === "s2" || stage === "s3" || stage === "s4";
}

export default function PipelineRightCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[] | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(false);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return `${file.name} • ${Math.round(file.size / 1024)} KB • ${file.type || "unknown"}`;
  }, [file]);

  async function getJWTOrNull(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.access_token ?? null; 
  }

  async function ensureLoggedInOrExplain(): Promise<string | null> {
    setCheckingAuth(true);
    try {
      const jwt = await getJWTOrNull();
      if (!jwt) {
        setError("Please sign in first to use the upload pipeline.");
        setStage("error");
        return null;
      }
      return jwt;
    } finally {
      setCheckingAuth(false);
    }
  }

  function pickFile() {
    inputRef.current?.click();
  }

  function clearAll() {
    setFile(null);
    setStage("idle");
    setError(null);
    setCdnUrl(null);
    setImageId(null);
    setCaptions(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runPipeline() {
    setError(null);
    setCaptions(null);
    setCdnUrl(null);
    setImageId(null);

    const jwt = await ensureLoggedInOrExplain();
    if (!jwt) return;

    if (!file) {
      setError("Pick an image first.");
      setStage("error");
      return;
    }

    // Supported types per assignment
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
      setStage("error");
      return;
    }

    try {
      // Step 1
      setStage("s1");
      const r1 = await fetch(`/api/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type || "image/jpeg" }),
      });
      if (!r1.ok) throw new Error(`Step 1 failed (${r1.status}): ${await r1.text()}`);
      const s1 = await r1.json();
      const presignedUrl = s1?.presignedUrl;
      const newCdnUrl = s1?.cdnUrl;
      if (!presignedUrl || !newCdnUrl) throw new Error("Step 1 response missing presignedUrl/cdnUrl.");
      setCdnUrl(newCdnUrl);

      // Step 2
      setStage("s2");
      const r2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!r2.ok) throw new Error(`Step 2 failed (${r2.status}): ${await r2.text().catch(() => "")}`);

      // Step 3
      setStage("s3");
      const r3 = await fetch(`/api/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: newCdnUrl, isCommonUse: false }),
      });
      if (!r3.ok) throw new Error(`Step 3 failed (${r3.status}): ${await r3.text()}`);
      const s3 = await r3.json();
      const newImageId = s3?.imageId;
      if (!newImageId) throw new Error("Step 3 response missing imageId.");
      setImageId(newImageId);

      // Step 4
      setStage("s4");
      const r4 = await fetch(`/api/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: newImageId }),
      });
      if (!r4.ok) throw new Error(`Step 4 failed (${r4.status}): ${await r4.text()}`);
      const s4 = await r4.json();
      setCaptions(Array.isArray(s4) ? s4 : [s4]);

      setStage("done");
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStage("error");
    }
  }

  const progress =
    stage === "idle"
      ? 0
      : stage === "s1"
      ? 0.25
      : stage === "s2"
      ? 0.5
      : stage === "s3"
      ? 0.75
      : stage === "s4"
      ? 0.9
      : 1;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Caption Uploader</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{STAGE_LABEL[stage]}</div>
      </div>

      {/* progress bar */}
      <div
        style={{
          marginTop: 10,
          height: 8,
          borderRadius: 999,
          background: "rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(progress * 100)}%`,
            background: "black",
            borderRadius: 999,
            transition: "width 200ms ease",
          }}
        />
      </div>

      <div style={{ marginTop: 12, fontSize: 13, color: "#444", lineHeight: 1.45 }}>
        Upload an image (logged-in users only) and generate captions via the staging pipeline API.
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          setError(null);
          setStage("idle");
          setCdnUrl(null);
          setImageId(null);
          setCaptions(null);
        }}
      />

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={pickFile}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.14)",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Choose file
          </button>

          <button
            onClick={runPipeline}
            disabled={!file || isBusy(stage) || checkingAuth}
            style={{
              flex: 1.2,
              height: 42,
              borderRadius: 12,
              border: "none",
              background: "black",
              color: "white",
              fontWeight: 900,
              cursor: !file || isBusy(stage) || checkingAuth ? "not-allowed" : "pointer",
              opacity: !file || isBusy(stage) || checkingAuth ? 0.55 : 1,
            }}
          >
            {isBusy(stage) ? "Running…" : "Run pipeline"}
          </button>
        </div>

        {fileMeta ? (
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: 12,
              color: "#333",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ opacity: 0.85 }}>{fileMeta}</span>
            <button
              onClick={clearAll}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: 900,
                opacity: 0.75,
              }}
              title="Clear"
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#777" }}>
            Choose an image to enable <b>Run pipeline</b>.
          </div>
        )}

        {error ? (
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              background: "rgba(220, 20, 60, 0.08)",
              border: "1px solid rgba(220, 20, 60, 0.25)",
              color: "crimson",
              whiteSpace: "pre-wrap",
              fontSize: 12,
            }}
          >
            {error}
            {error.toLowerCase().includes("sign in") ? (
              <div style={{ marginTop: 8 }}>
                <a
                  href="/protected"
                  style={{ color: "crimson", fontWeight: 900, textDecoration: "underline" }}
                >
                  Sign in →
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {cdnUrl ? (
          <div
            style={{
              marginTop: 6,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ padding: 10, fontSize: 12, color: "#555", display: "flex", justifyContent: "space-between" }}>
              <span>Uploaded preview</span>
              <span style={{ opacity: 0.7 }}>imageId: {imageId ?? "…"}</span>
            </div>
            <div style={{ background: "white", padding: 10, display: "grid", placeItems: "center" }}>
              <img
                src={cdnUrl}
                alt="Uploaded"
                style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 10 }}
              />
            </div>
          </div>
        ) : null}

        {captions ? (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Generated captions</div>
            <div style={{ display: "grid", gap: 8 }}>
              {captions.slice(0, 10).map((c, i) => {
                const text =
                  c?.text ?? c?.content ?? c?.caption ?? c?.caption_text ?? c?.value ?? null;
                return (
                  <div
                    key={c?.id ?? i}
                    style={{
                      padding: 10,
                      borderRadius: 14,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.10)",
                      lineHeight: 1.35,
                      fontSize: 14,
                    }}
                  >
                    {text ? String(text) : (
                      <code style={{ fontSize: 12 }}>{JSON.stringify(c)}</code>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
