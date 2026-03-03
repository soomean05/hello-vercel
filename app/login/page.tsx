export const dynamic = "force-dynamic";
export const revalidate = 0;

import LoginClient from "./login-client";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next =
    typeof searchParams?.next === "string" && searchParams.next.length > 0
      ? searchParams.next
      : "/rate";

  return <LoginClient next={next} />;
}
