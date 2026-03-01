import UploadAndCaption from "./upload-and-caption";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "./signout-button";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "system-ui",
        background: "#f6f7f9",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 760,
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Caption Pipeline</h1>
            <p style={{ marginTop: 8, color: "#444" }}>
              Signed in as: <strong>{data.user?.email}</strong>
            </p>
          </div>
          <div style={{ alignSelf: "start" }}>
            <SignOutButton />
          </div>
        </div>

        <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #eee" }} />

        <UploadAndCaption />
      </section>
    </main>
  );
}
