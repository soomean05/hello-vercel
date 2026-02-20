import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "./signout-button";
import CaptionRater from "@/app/components/CaptionRater";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();

  // Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#f6f7f9",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 520,
            background: "white",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.3 }}>
            Protected
          </h1>
          <p style={{ marginTop: 10, color: "#444" }}>You are not logged in.</p>
          <p style={{ marginTop: 10, color: "#666", fontSize: 14 }}>
            Please sign in, then return to /protected.
          </p>
        </section>
      </main>
    );
  }

  // Fetch captions (no ordering to avoid missing columns)
  const { data: captions, error: captionsError } = await supabase
    .from("captions")
    .select("id, content");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: "#f6f7f9",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 560,
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.3 }}>
              Protected
            </h1>
            <p style={{ marginTop: 10, color: "#444" }}>
              Signed in as: <strong>{user.email}</strong>
            </p>
          </div>

          <div style={{ marginTop: 6 }}>
            <SignOutButton />
          </div>
        </div>

        <hr style={{ margin: "22px 0", opacity: 0.25 }} />

        <h2 style={{ margin: 0, fontSize: 18 }}>Rate captions</h2>

        {captionsError ? (
          <p style={{ marginTop: 10, color: "crimson" }}>
            Error loading captions: {captionsError.message}
          </p>
        ) : (
          <CaptionRater
            captions={(captions ?? []).map((c: any) => ({
              id: c.id,
              content: c.content,
            }))}
          />
        )}
      </section>
    </main>
  );
}
