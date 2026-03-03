"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthDebug() {
  const [session, setSession] = useState<{ user?: { email?: string }; access_token?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      console.log("getSession on mount:", data.session);
    });
  }, []);

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        background: "rgba(0,0,0,0.3)",
        borderRadius: 12,
        fontSize: 13,
        fontFamily: "monospace",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Auth diagnostics</div>
      <div>session?.user?.email: {session?.user?.email ?? "null"}</div>
      <div>session?.access_token: {session?.access_token ? "HAS TOKEN" : "NO TOKEN"}</div>
    </div>
  );
}
