"use client";

import { supabase } from "@/lib/supabase/client";

export default function SignOutButton() {
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button
      onClick={signOut}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "white",
        color: "#111",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}

