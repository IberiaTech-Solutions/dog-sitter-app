import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requirePartner(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, email")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(`/${locale}/login`);
  if (profile.role !== "partner") {
    if (profile.role === "admin") redirect(`/${locale}/admin`);
    redirect(`/${locale}/dashboard`);
  }

  const { data: partnerProfile } = await supabase
    .from("partner_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, supabase, profile, partnerProfile };
}
