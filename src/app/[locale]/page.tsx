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

  // Signed-in users go straight to dashboard
  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <>
      <AuthHashHandler />
      <LandingPage />
    </>
  );
}
