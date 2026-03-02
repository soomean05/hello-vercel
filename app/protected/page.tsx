// app/protected/page.tsx
import { redirect } from "next/navigation";
import UploadAndCaption from "./upload-and-caption";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "./signout-button";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: "linear-gradient(180deg, #f6f7f9 0%, #ffffff 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 820,
          background: "white",
          borderRadius: 18,
          padding: 26,
          boxShadow: "0 12px 36px rgba(0,0,0,0.09)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              Image Upload Pipeline
            </h1>
            <p style={{ marginTop: 8, color: "#444" }}>
              Signed in as: <strong>{data.user.email}</strong>
            </p>
          </div>

          <SignOutButton />
        </header>

        <hr style={{ margin: "18px 0", borderTop: "1px solid #eee" }} />

        {/* PIPELINE SECTION */}
        <UploadAndCaption />

        {/* RATINGS SECTION */}
        <div
          id="ratings"
          style={{
            marginTop: 60,
            paddingTop: 24,
            borderTop: "1px solid #eee",
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Ratings Section</h2>

          <p style={{ color: "#555", marginBottom: 16 }}>
            This is where users can rate captions stored in the database.
          </p>

          {/* TODO: Insert your existing voting component here */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#fafafa",
              border: "1px solid #eee",
            }}
          >
            Your voting UI goes here.
          </div>
        </div>
      </section>
    </main>
  );
}
