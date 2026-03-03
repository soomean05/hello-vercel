import { supabase } from "@/lib/supabaseClient";

export async function getProfileIdFromSession(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const session = data.session;
  if (!session) throw new Error("Not logged in");

  const u: any = session.user;

  const candidates = [
    u?.app_metadata?.profile_id,
    u?.app_metadata?.profileId,
    u?.user_metadata?.profile_id,
    u?.user_metadata?.profileId,
  ].filter(Boolean);

  const profileId = candidates[0];
  if (!profileId) {
    throw new Error(
      "Could not find profile_id in session metadata. Your Supabase JWT needs a profile_id claim."
    );
  }

  return String(profileId);
}
