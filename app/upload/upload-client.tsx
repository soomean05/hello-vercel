"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

export default function UploadClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function runPipeline() {
    if (!file) return alert("Choose an image first.");
    if (!SUPPORTED.has(file.type)) return alert(`Unsupported type: ${file.type}`);

    setBusy(true);
    setStatus("");
    setCaptions([]);
    setCdnUrl(null);
    setImageId(null);

    try {
      // Step 1
      setStatus("Step 1/4: Getting presigned URL…");
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

      // Step 2
      setStatus("Step 2/4: Uploading bytes…");
      const r2 = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!r2.ok) throw new Error(await r2.text());

      // Step 3
      setStatus("Step 3/4: Registering image…");
      const r3 = await fetch("/api/pipeline/upload-image-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cdnUrlFromApi, isCommonUse: false }),
      });
      const j3 = await r3.json().catch(() => ({}));
      if (!r3.ok) throw new Error(j3.error || JSON.stringify(j3));

      const imageIdFromApi: string = j3.imageId;
      setImageId(imageIdFromApi);

      // Step 4
      setStatus("Step 4/4: Generating captions…");
      const r4 = await fetch("/api/pipeline/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: imageIdFromApi }),
      });
      const j4 = await r4.json().catch(() => ({}));
      if (!r4.ok) throw new Error(j4.error || JSON.stringify(j4));

      setCaptions(Array.isArray(j4) ? j4 : j4.captions ?? []);
      setStatus("Done ✅");
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "Pipeline failed");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7f9", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: 14 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 950, fontSize: 20 }}>Upload</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => router.push("/rate")} style={btn}>Go to Rate</button>
            <button onClick={() => router.push("/protected")} style={btn}>Protected</button>
            <button onClick={signOut} style={btn}>Sign out</button>
          </div>
        </header>

        <section style={card}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
            disabled={busy}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => fileRef.current?.click()} disabled={busy} style={btn}>
              Choose Image
            </button>
            {file ? <div style={{ opacity: 0.75, fontSize: 14 }}>Selected: {file.name}</div> : null}
          </div>

          <button onClick={runPipeline} disabled={busy || !file} style={btnPrimary}>
            {busy ? "Working…" : "Upload + Generate Captions"}
          </button>

          {status ? <div style={{ opacity: 0.75 }}>{status}</div> : null}
          {cdnUrl ? <div style={{ opacity: 0.7, fontSize: 13, wordBreak: "break-all" }}>cdnUrl: {cdnUrl}</div> : null}
          {imageId ? <div style={{ opacity: 0.7, fontSize: 13 }}>imageId: {imageId}</div> : null}

          {captions.length > 0 ? (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <div style={{ fontWeight: 900 }}>Generated captions</div>
              {captions.slice(0, 10).map((c: any, i: number) => (
                <div key={i} style={capCard}>
                  {c.content ?? c.text ?? c.caption ?? JSON.stringify(c)}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "white",
  fontWeight: 950,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 12,
};

const capCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 14,
  background: "#fafafa",
  border: "1px solid rgba(0,0,0,0.08)",
};

