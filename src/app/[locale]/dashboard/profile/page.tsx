import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Header, PageShell } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(`/${locale}/login`);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn />

      <PageShell>
        <h1 className="text-2xl font-bold text-stone-900">
          {locale === "es" ? "Mi perfil" : "My profile"}
        </h1>
        <p className="mt-2 text-stone-500">
          {locale === "es"
            ? "Actualiza tu información personal."
            : "Update your personal information."}
        </p>

        <ProfileForm profile={profile} userId={user.id} />
      </PageShell>
    </div>
  );
}
