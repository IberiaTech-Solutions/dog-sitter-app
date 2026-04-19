import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { AuthHashHandler } from "@/components/auth-hash-handler";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Route signed-in users to the dashboard appropriate to their role.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") redirect(`/${locale}/admin`);
    if (profile?.role === "partner") redirect(`/${locale}/partner`);
    redirect(`/${locale}/dashboard`);
  }

  return (
    <>
      <AuthHashHandler />
      <LandingPage />
    </>
  );
}
