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
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.3 }}>Protected</h1>
        <p style={{ marginTop: 10, color: "#444" }}>
          Signed in as: <strong>{data.user?.email}</strong>
        </p>

        <div style={{ marginTop: 18 }}>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}

