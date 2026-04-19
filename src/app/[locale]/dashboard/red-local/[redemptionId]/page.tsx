import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, DashboardShell, PageShell, Badge } from "@/components/ui";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  params: Promise<{ locale: string; redemptionId: string }>;
};

export default async function RedemptionDetailPage({ params }: Props) {
  const { locale, redemptionId } = await params;
  const t = await getTranslations({ locale });
  const es = locale === "es";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: redemption } = await supabase
    .from("partner_discount_redemptions")
    .select(`
      id, redemption_token, status, issued_at, redeemed_at, expires_at,
      discount:partner_discounts (
        id, discount_code, discount_percent, description_es, description_en, valid_until,
        partner:partner_profiles (id, business_name, business_type, city, phone, website, address)
      )
    `)
    .eq("id", redemptionId)
    .single();

  if (!redemption) notFound();

  const discount = redemption.discount as unknown as {
    id: string;
    discount_code: string;
    discount_percent: number;
    description_es: string;
    description_en: string | null;
    partner: {
      id: string;
      business_name: string;
      business_type: string;
      city: string;
      phone: string | null;
      website: string | null;
      address: string | null;
    };
  };
  const partner = discount.partner;
  const isRedeemed = redemption.status === "redeemed";
  const isExpired =
    redemption.expires_at != null &&
    new Date(redemption.expires_at).getTime() < Date.now();

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
      backHref="/dashboard/red-local"
      backLabel={es ? "Red local" : "Local network"}
    >
      <PageShell maxWidth="sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
            {partner.business_name}
          </p>
          <h1 className="mt-3 font-serif text-h2 font-semibold text-ink">
            -{discount.discount_percent}%
          </h1>
          <p className="mt-2 text-ink-muted">
            {es ? discount.description_es : discount.description_en ?? discount.description_es}
          </p>
        </div>

        {/* QR / status card */}
        <Card padding="lg" className="mt-8">
          {isRedeemed ? (
            <div className="text-center py-10">
              <Badge variant="brand" className="mb-4">
                {es ? "Canjeado" : "Redeemed"}
              </Badge>
              <p className="text-ink">
                {es
                  ? "Esta oferta ya ha sido canjeada."
                  : "This offer has been redeemed."}
              </p>
              {redemption.redeemed_at && (
                <p className="mt-2 text-sm text-ink-muted">
                  {new Date(redemption.redeemed_at).toLocaleString(
                    es ? "es-ES" : "en-GB",
                    { dateStyle: "long", timeStyle: "short" }
                  )}
                </p>
              )}
            </div>
          ) : isExpired ? (
            <div className="text-center py-10">
              <Badge variant="danger" className="mb-4">
                {es ? "Caducada" : "Expired"}
              </Badge>
              <p className="text-ink">
                {es
                  ? "Este código ya no es válido. Genera uno nuevo desde la red local."
                  : "This code is no longer valid. Generate a new one from the local network."}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-block p-4 bg-surface rounded-2xl border border-line">
                <QRCodeSVG
                  value={redemption.redemption_token}
                  size={220}
                  level="M"
                  marginSize={0}
                />
              </div>
              <p className="mt-6 font-mono text-xs text-ink-soft break-all px-4">
                {redemption.redemption_token}
              </p>
              <p className="mt-4 text-sm text-ink-muted">
                {es
                  ? "Muestra este código al llegar al negocio."
                  : "Show this code at the business."}
              </p>
              {redemption.expires_at && (
                <p className="mt-2 text-xs text-ink-soft">
                  {es ? "Caduca" : "Expires"}{" "}
                  {new Date(redemption.expires_at).toLocaleDateString(
                    es ? "es-ES" : "en-GB",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Partner location */}
        <Card padding="md" className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
            {es ? "Dónde canjearlo" : "Where to redeem"}
          </p>
          <p className="mt-2 font-semibold text-ink">{partner.business_name}</p>
          <p className="text-sm text-ink-muted">
            {partner.address ? `${partner.address} · ` : ""}
            {partner.city}
          </p>
          {partner.phone && (
            <p className="text-sm text-ink-soft mt-1">{partner.phone}</p>
          )}
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-sm text-brand hover:text-brand-ink transition-colors"
            >
              {partner.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </Card>
      </PageShell>
    </DashboardShell>
  );
}
