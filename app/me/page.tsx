import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 16, color: "#0066cc" }}>
        ← Home
      </Link>
      <h1 style={{ margin: "0 0 16px 0" }}>Auth self-test</h1>
      {user ? (
        <div>
          <p><strong>Logged in</strong></p>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email ?? "(none)"}</p>
        </div>
      ) : (
        <p><strong>Not logged in</strong> — cookie not readable on server.</p>
      )}
    </main>
  );
}
