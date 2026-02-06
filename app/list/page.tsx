export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabaseClient";

export default async function ListPage() {
  const { data, error } = await supabase
    .from("dorms")
    .select("*")
    .limit(20);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Dorms</h1>

      {error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}


