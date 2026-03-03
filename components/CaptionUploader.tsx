"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function normalizeCaptions(payload: any): string[] {
  const grab = (x: any) =>
    typeof x === "string" ? x : x?.text ?? x?.content ?? x?.caption ?? x?.captionText ?? null;

  if (Array.isArray(payload)) {
    return payload.map(grab).filter((s) => typeof s === "string" && s.trim().length > 0);
  }
  if (Array.isArray(payload?.captions)) {
    return payload.captions
      .map(grab)
      .filter((s: any) => typeof s === "string" && s.trim().length > 0);
  }
  return [];
}

type Props = {
  title?: string;
  subtitle?: string;
  onSaved?: () => void; // call this after saving so /rate can refresh feed
};

export default function CaptionUploader({
  title = "Upload an image → auto-generate captions",
  subtitle = "Uses AlmostCrackd pipeline (presign → upload → register → generate captions).",
  onSaved,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [generated, setGenerated] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [pendingCdnUrl, setPendingCdnUrl] = useState<string | null>(null);

  // Cleanup preview object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function authedPipeline(body: any) {
    const { data: sess, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) throw sessErr;

    const token = sess.session?.access_token;
    if (!token) throw new Error("Not logged in");

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error ?? `Server returned ${res.status}`);
    return json;
  }

  async function generateCaptions() {
    setStatus(null);

    try {
      if (!file) throw new Error("Choose an image first.");

      const { data: sess0, error: sessErr0 } = await supabase.auth.getSession();
      if (sessErr0) throw sessErr0;
      if (!sess0.session?.user) throw new Error("Not logged in.");

      const contentType = file.type;
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("Unsupported file type (must be an image).");
      }

      setBusy(true);

      // 1) presign
      const presign = await authedPipeline({ step: "presign", contentType });
      const presignedUrl: string = presign.presignedUrl;
      const cdnUrl: string = presign.cdnUrl;
      if (!presignedUrl || !cdnUrl) throw new Error("Bad presign response.");

      // 2) PUT bytes to presigned URL
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload to presigned URL failed (${putRes.status}).`);

      // 3) register
      const reg = await authedPipeline({ step: "register", imageUrl: cdnUrl });
      const imageId: string = reg.imageId;
      if (!imageId) throw new Error("Bad register response (missing imageId).");

      // 4) captions
      const capPayload = await authedPipeline({ step: "captions", imageId });
      const caps = normalizeCaptions(capPayload).slice(0, 5); // ✅ only 5
      if (caps.length === 0) throw new Error("No captions returned from pipeline.");

      setPendingCdnUrl(cdnUrl);
      setGenerated(caps);

      const init: Record<number, boolean> = {};
      for (let i = 0; i < caps.length; i++) init[i] = true; // default all selected
      setSelected(init);

      setStatus("Pick captions, then click Save selected captions.");
    } catch (e: any) {
      setStatus(`Generate failed: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveSelected() {
    setStatus(null);

    try {
      const { data: sess0, error: sessErr0 } = await supabase.auth.getSession();
      if (sessErr0) throw sessErr0;

      const user = sess0.session?.user;
      if (!user) throw new Error("Not logged in.");

      if (!pendingCdnUrl) throw new Error("Missing uploaded image URL.");
      if (generated.length === 0) throw new Error("No generated captions to save.");

      const chosen = generated.filter((_, i) => selected[i]);
      if (chosen.length === 0) throw new Error("Select at least 1 caption.");

      // Insert image
      const { data: imgRow, error: imgErr } = await supabase
        .from("images")
        .insert({ url: pendingCdnUrl })
        .select("id")
        .single();
      if (imgErr) throw imgErr;

      const newImageId = imgRow.id;

      // Insert captions (respect NOT NULL constraints)
      const capRows = chosen.map((c) => ({
        image_id: newImageId,
        content: c,
        is_public: true,
        profile_id: user.id,
      }));

      const { error: capErr } = await supabase.from("captions").insert(capRows);
      if (capErr) throw capErr;

      setStatus(`Saved ✅ (${chosen.length} captions)`);
      setGenerated([]);
      setSelected({});
      setPendingCdnUrl(null);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Keep preview? If you want to clear it after save:
      // setPreviewUrl(null);

      onSaved?.();
    } catch (e: any) {
      setStatus(`Save failed: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <section
      style={{
        padding: 18,
        borderRadius: 18,
        background: "white",
        boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <div style={{ opacity: 0.75, fontSize: 13 }}>{subtitle}</div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          setStatus(null);

          setGenerated([]);
          setSelected({});
          setPendingCdnUrl(null);

          if (previewUrl) URL.revokeObjectURL(previewUrl);

          if (f) {
            setPreviewUrl(URL.createObjectURL(f));
          } else {
            setPreviewUrl(null);
          }
        }}
      />

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Choose file
        </button>
        <div style={{ fontSize: 13, opacity: 0.75 }}>{file ? file.name : "No file selected"}</div>
      </div>

      {/* Preview */}
      {previewUrl ? (
        <div
          style={{
            marginTop: 6,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.03)",
            borderRadius: 16,
            padding: 12,
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: 320,
              borderRadius: 14,
              objectFit: "contain",
            }}
          />
        </div>
      ) : null}

      {status ? (
        <div style={{ color: status.includes("failed") ? "crimson" : status.includes("Saved") ? "green" : "#333" }}>
          {status}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={generateCaptions}
          disabled={busy || !file}
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            fontWeight: 900,
            cursor: busy || !file ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Generating…" : "Generate 5 captions"}
        </button>
      </div>

      {/* Caption picker */}
      {generated.length > 0 ? (
        <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
          <div style={{ fontWeight: 900 }}>Pick captions to save:</div>

          <div style={{ display: "grid", gap: 8 }}>
            {generated.map((c, i) => (
              <label
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!selected[i]}
                  onChange={(e) => setSelected((prev) => ({ ...prev, [i]: e.target.checked }))}
                  style={{ marginTop: 3 }}
                />
                <span style={{ lineHeight: 1.35 }}>{c}</span>
              </label>
            ))}
          </div>

          <button
            onClick={saveSelected}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.15)",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Save selected captions
          </button>
        </div>
      ) : null}
    </section>
  );
}
