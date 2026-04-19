import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Clock, Tag, Briefcase, ArrowRight } from "lucide-react";
import { Card, DashboardShell, PageShell } from "@/components/ui";
import { requirePartner } from "@/lib/partner";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOverviewPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, partnerProfile } = await requirePartner(locale);
  const es = locale === "es";

  const userId = profile.full_name ? partnerProfile?.id : null;

  // Stats (all guarded by RLS — partner only sees their own rows)
  const [{ count: activeDiscounts }, { count: totalRedemptions }, { count: monthRedemptions }] =
    await Promise.all([
      supabase
        .from("partner_discounts")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", userId ?? "")
        .eq("is_active", true),
      supabase
        .from("partner_discount_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "redeemed"),
      supabase
        .from("partner_discount_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "redeemed")
        .gte("redeemed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

  const isVerified = partnerProfile?.is_verified ?? false;

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name ?? ""}
      userRole={profile.role}
      avatarUrl={profile.avatar_url}
    >
      <PageShell>
        <div>
          <h1 className="font-serif text-h2 font-semibold text-ink">
            {es ? "Panel de negocio" : "Business panel"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {partnerProfile?.business_name ?? profile.full_name}
          </p>
        </div>

        {/* Verification status */}
        <Card padding="lg" className="mt-6">
          <div className="flex items-start gap-4">
            {isVerified ? (
              <ShieldCheck
                className="w-6 h-6 text-brand shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ) : (
              <Clock
                className="w-6 h-6 text-warning-ink shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
            <div className="flex-1">
              <h2 className="font-semibold text-ink">
                {isVerified
                  ? es
                    ? "Negocio verificado"
                    : "Business verified"
                  : es
                    ? "Verificación pendiente"
                    : "Verification pending"}
              </h2>
              <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                {isVerified
                  ? es
                    ? "Tus ofertas son visibles para cuidadores y dueños en la red."
                    : "Your offers are visible to sitters and owners in the network."
                  : es
                    ? "Estamos revisando tu información. Normalmente aprobamos en 24 horas. Mientras, puedes completar tu perfil y preparar tus ofertas."
                    : "We're reviewing your information. Approval typically takes 24 hours. Meanwhile, you can complete your profile and prepare your offers."}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card padding="md">
            <Tag className="w-5 h-5 text-ink-soft" aria-hidden="true" />
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {activeDiscounts ?? 0}
            </p>
            <p className="text-sm text-ink-muted">
              {es ? "Ofertas activas" : "Active offers"}
            </p>
          </Card>
          <Card padding="md">
            <Briefcase className="w-5 h-5 text-ink-soft" aria-hidden="true" />
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {totalRedemptions ?? 0}
            </p>
            <p className="text-sm text-ink-muted">
              {es ? "Canjes totales" : "Total redemptions"}
            </p>
          </Card>
          <Card padding="md">
            <Tag className="w-5 h-5 text-ink-soft" aria-hidden="true" />
            <p className="mt-2 font-serif text-3xl font-semibold text-ink">
              {monthRedemptions ?? 0}
            </p>
            <p className="text-sm text-ink-muted">
              {es ? "Canjes este mes" : "Redemptions this month"}
            </p>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/partner/profile"
            className="group flex items-center justify-between p-5 rounded-2xl bg-surface border border-line hover:border-ink-soft/30 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-semibold text-ink">
                {es ? "Editar perfil" : "Edit profile"}
              </p>
              <p className="text-sm text-ink-muted mt-0.5">
                {es
                  ? "Información, dirección, logo, descripción."
                  : "Info, address, logo, description."}
              </p>
            </div>
            <ArrowRight
              className="w-4 h-4 text-ink-soft group-hover:text-ink transition-colors"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/partner/discounts"
            className="group flex items-center justify-between p-5 rounded-2xl bg-surface border border-line hover:border-ink-soft/30 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-semibold text-ink">
                {es ? "Gestionar ofertas" : "Manage offers"}
              </p>
              <p className="text-sm text-ink-muted mt-0.5">
                {es
                  ? "Crear, pausar o editar descuentos."
                  : "Create, pause, or edit discount offers."}
              </p>
            </div>
            <ArrowRight
              className="w-4 h-4 text-ink-soft group-hover:text-ink transition-colors"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/partner/redemptions"
            className="group flex items-center justify-between p-5 rounded-2xl bg-surface border border-line hover:border-ink-soft/30 hover:shadow-sm transition-all"
          >
            <div>
              <p className="font-semibold text-ink">
                {es ? "Canjear código" : "Redeem code"}
              </p>
              <p className="text-sm text-ink-muted mt-0.5">
                {es
                  ? "Introduce el código que trae el cliente."
                  : "Enter the code the customer brings."}
              </p>
            </div>
            <ArrowRight
              className="w-4 h-4 text-ink-soft group-hover:text-ink transition-colors"
              aria-hidden="true"
            />
          </Link>
        </div>
      </PageShell>
    </DashboardShell>
  );
}
