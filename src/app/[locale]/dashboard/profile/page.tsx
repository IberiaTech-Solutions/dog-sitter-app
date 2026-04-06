import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/ui";
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
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name}
      userRole={profile.role}
      backHref="/dashboard"
      title={locale === "es" ? "Mi perfil" : "My profile"}
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-stone-900">
          {locale === "es" ? "Mi perfil" : "My profile"}
        </h1>
        <p className="mt-1 text-stone-500">
          {locale === "es"
            ? "Actualiza tu información personal."
            : "Update your personal information."}
        </p>
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </DashboardShell>
  );
}
