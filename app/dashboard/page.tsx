import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/dashboard");

  const userId = data.user.id;

  const [votesRes, uploadsRes] = await Promise.all([
    supabase
      .from("caption_votes")
      .select("id, caption_id, vote_value, created_datetime_utc")
      .eq("user_id", userId)
      .order("created_datetime_utc", { ascending: false })
      .limit(20),
    supabase
      .from("images")
      .select("id, url, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const votes = votesRes.data ?? [];
  const uploads = uploadsRes.data ?? [];

  const card: React.CSSProperties = {
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7f9",
        padding: 24,
        fontFamily: "system-ui",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            ...card,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827" }}>Dashboard</h1>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#374151" }}>
              Signed in as <strong>{data.user.email ?? data.user.id}</strong>
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              fontWeight: 700,
              textDecoration: "none",
              color: "#111827",
              fontSize: 14,
            }}
          >
            Sign out
          </Link>
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: 18, color: "#111827" }}>My recent votes</h2>
          {votes.length === 0 ? (
            <p style={{ color: "#374151", margin: 0 }}>No votes yet. Head to /rate to start.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {votes.map((v: any) => (
                <div
                  key={v.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#fafafa",
                    border: "1px solid #eee",
                    fontSize: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#111827" }}>Caption {v.caption_id} → {v.vote_value === 1 ? "👍" : "👎"}</span>
                  <span style={{ fontSize: 12, color: "#4b5563" }}>
                    {v.created_datetime_utc ? new Date(v.created_datetime_utc).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: 18, color: "#111827" }}>My uploads</h2>
          {uploads.length === 0 ? (
            <p style={{ color: "#374151", margin: 0 }}>No uploads yet. Head to /upload to add images.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {uploads.map((u: any) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#fafafa",
                    border: "1px solid #eee",
                  }}
                >
                  {u.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.url}
                      alt=""
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                    />
                  )}
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: "#111827" }}>Image {u.id}</span>
                    {u.created_at && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#4b5563" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/rate"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: "white",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    Rate
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
