"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

useEffect(() => {
  (async () => {
    if (!supabase) {
      router.replace("/");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.replace("/");
      return;
    }
  })();
}, [router]);

  async function signOut() {
    if (!supabase) {
      router.replace("/");
      return; 
    }
    
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <main style={shell}>
      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 950 }}>Choose what to do</div>
            <div style={{ opacity: 0.65, marginTop: 4 }}>
              {email ? `Logged in as ${email}` : "Logged in"}
            </div>
          </div>
          <button onClick={signOut} style={btn}>Sign out</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={() => router.push("/rate")} style={choiceBtn}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Rate captions</div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>
              Vote 👍/👎 and save to caption_votes.
            </div>
          </button>

          <button onClick={() => router.push("/upload")} style={choiceBtn}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Upload image</div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>
              AlmostCrackd pipeline → generates captions.
            </div>
          </button>
        </div>
      </section>
    </main>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f7f9",
  padding: 24,
  fontFamily: "system-ui",
  display: "grid",
  placeItems: "center",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "white",
  borderRadius: 22,
  padding: 28,
  boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 14,
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
  height: 42,
};

const choiceBtn: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fafafa",
  cursor: "pointer",
  textAlign: "left",
};
