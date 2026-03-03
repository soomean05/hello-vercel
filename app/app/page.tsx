import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppClient from "./app-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/");

  const { data: captions, error: capErr } = await supabase
    .from("captions")
    .select("*")
    .limit(200);

  const captionRows = (captions ?? []) as any[];
  let urlByImageId = new Map<string, string>();

  if (capErr) {
    // Still render page; RateSection will show empty state
  } else if (captionRows.some((c) => !c?.image_url) && captionRows.some((c) => c?.image_id)) {
    const imageIds = Array.from(
      new Set(captionRows.map((c) => c?.image_id).filter(Boolean).map(String))
    );
    if (imageIds.length > 0) {
      const { data: images } = await supabase
        .from("images")
        .select("id, url")
        .in("id", imageIds);
      (images ?? []).forEach((im: any) => {
        if (im?.id && im?.url) urlByImageId.set(String(im.id), String(im.url));
      });
    }
  }

  const items = capErr
    ? []
    : captionRows
        .map((c) => {
          const id = c?.id;
          const content = String(c?.content ?? c?.text ?? "");
          const imageUrl =
            (c?.image_url as string | null) ?? urlByImageId.get(String(c?.image_id)) ?? null;
          if (!id || !content) return null;
          return { id, content, imageUrl };
        })
        .filter(Boolean) as { id: string | number; content: string; imageUrl: string | null }[];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        fontFamily: "system-ui",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#111",
            textDecoration: "none",
          }}
        >
          CaptionRater
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#666" }}>
            {data.user.email ?? "Signed in"}
          </span>
          <Link
            href="/api/auth/signout"
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              color: "#111",
            }}
          >
            Sign out
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <AppClient items={items} />
      </div>
    </main>
  );
}
