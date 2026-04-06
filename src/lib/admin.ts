import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch pending verification count for admin nav badge
  const { count: pendingVerifications } = await supabase
    .from("verifications")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "submitted"]);

  return { user, supabase, profile, pendingVerifications: pendingVerifications ?? 0 };
}
