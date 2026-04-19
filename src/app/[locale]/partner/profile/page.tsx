import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, DashboardShell, PageShell } from "@/components/ui";
import { requirePartner } from "@/lib/partner";
import { PartnerProfileForm } from "@/components/partner-profile-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerProfilePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { profile, partnerProfile } = await requirePartner(locale);
  const es = locale === "es";

  if (!partnerProfile) {
    redirect(`/${locale}/partners/signup`);
  }

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name ?? ""}
      userRole={profile.role}
      avatarUrl={profile.avatar_url}
      backHref="/partner"
      backLabel={es ? "Panel" : "Dashboard"}
    >
      <PageShell maxWidth="md">
        <div>
          <h1 className="font-serif text-h2 font-semibold text-ink">
            {es ? "Perfil de negocio" : "Business profile"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {es
              ? "Información que ven los cuidadores y dueños."
              : "Information visible to sitters and owners."}
          </p>
        </div>

        <Card padding="lg" className="mt-6">
          <PartnerProfileForm profile={partnerProfile} />
        </Card>
      </PageShell>
    </DashboardShell>
  );
}
