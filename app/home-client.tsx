"use client";

import Link from "next/link";

export default function HomeClient({ email }: { email: string | null }) {
  if (email) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Quick Actions</div>
        <p style={{ margin: 0, fontSize: 14, color: "#444", marginBottom: 18 }}>
          Signed in as: <strong>{email}</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/rate"
            style={{
              display: "block",
              padding: "14px 18px",
              borderRadius: 14,
              background: "black",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Rate captions
          </Link>
          <Link
            href="/upload"
            style={{
              display: "block",
              padding: "14px 18px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              color: "#111",
              textDecoration: "none",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Upload image
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: "block",
              padding: "14px 18px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              color: "#111",
              textDecoration: "none",
              fontWeight: 700,
              textAlign: "center",
              opacity: 0.9,
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Quick Actions</div>
      <Link
        href="/login"
        style={{
          display: "block",
          padding: "16px 24px",
          borderRadius: 14,
          background: "black",
          color: "white",
          textDecoration: "none",
          fontWeight: 800,
          textAlign: "center",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        Continue with Google
      </Link>
      <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
        You need an account to rate or upload.
      </p>
    </div>
  );
}
