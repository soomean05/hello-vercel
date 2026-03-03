import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import UploadClient from "./upload-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/upload");

  return <UploadClient />;
}
