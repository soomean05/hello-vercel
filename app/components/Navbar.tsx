import Link from "next/link";
import SignOutButton from "@/app/protected/signout-button";

export default function Navbar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link
          href="/"
          style={{ fontSize: 18, fontWeight: 900, color: "#111", textDecoration: "none" }}
        >
          CaptionRater
        </Link>
        <Link
          href="/protected"
          style={{ fontSize: 14, color: "#444", textDecoration: "none", fontWeight: 500 }}
        >
          Dashboard
        </Link>
        <Link
          href="/rate"
          style={{ fontSize: 14, color: "#444", textDecoration: "none", fontWeight: 500 }}
        >
          Rate
        </Link>
        <Link
          href="/upload"
          style={{ fontSize: 14, color: "#444", textDecoration: "none", fontWeight: 500 }}
        >
          Upload
        </Link>
      </nav>
      <SignOutButton />
    </header>
  );
}
