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

  // Fetch available referral credit
  const { data: credits } = await supabase
    .from("referral_credits")
    .select("amount")
    .eq("user_id", user.id)
    .eq("is_used", false);

  const referralCredit = credits?.reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name}
      userRole={profile.role}
      avatarUrl={profile.avatar_url}
    >
      <div>
        <h1 className="font-serif text-h2 font-semibold text-ink">
          {locale === "es" ? "Mi perfil" : "My profile"}
        </h1>
        <p className="mt-1 text-ink-muted">
          {locale === "es"
            ? "Actualiza tu información personal."
            : "Update your personal information."}
        </p>
        <ProfileForm profile={profile} userId={user.id} referralCredit={referralCredit} />
      </div>
    </DashboardShell>
  );
}
