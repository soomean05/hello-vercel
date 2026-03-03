"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Dorm = { id?: string; name?: string } & Record<string, any>;

export default function ListPage() {
  const [rows, setRows] = useState<Dorm[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError(
          "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const { data, error } = await supabase.from("dorms").select("*").limit(20);
      if (error) {
        setError(error.message);
        return;
      }
      setRows((data as Dorm[]) ?? []);
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Dorms</h1>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <pre
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 12,
          background: "#f6f7f9",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(rows, null, 2)}
      </pre>
    </main>
  );
}
