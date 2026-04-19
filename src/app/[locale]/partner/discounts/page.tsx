import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, DashboardShell, PageShell, Badge } from "@/components/ui";
import { requirePartner } from "@/lib/partner";
import { PartnerDiscountForm } from "@/components/partner-discount-form";
import { PartnerDiscountActions } from "@/components/partner-discount-actions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerDiscountsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, partnerProfile } = await requirePartner(locale);
  const es = locale === "es";

  if (!partnerProfile) {
    redirect(`/${locale}/partners/signup`);
  }

  const { data: discounts } = await supabase
    .from("partner_discounts")
    .select("*")
    .eq("partner_id", partnerProfile.id)
    .order("created_at", { ascending: false });

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
            {es ? "Ofertas" : "Offers"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {es
              ? "Descuentos que ofreces a los clientes de nuestros cuidadores. Los cuidadores los presentan a sus dueños; tú verificas el código al canjear."
              : "Discounts you offer to our sitters' clients. Sitters present them to owners; you verify the code on redemption."}
          </p>
        </div>

        {/* Create form */}
        <Card padding="lg" className="mt-6">
          <h2 className="font-semibold text-ink mb-4">
            {es ? "Nueva oferta" : "New offer"}
          </h2>
          <PartnerDiscountForm
            partnerId={partnerProfile.id}
            partnerName={partnerProfile.business_name}
            partnerType={partnerProfile.business_type}
            city={partnerProfile.city}
          />
        </Card>

        {/* Existing discounts */}
        <div className="mt-10">
          <h2 className="font-semibold text-ink">
            {es ? "Tus ofertas" : "Your offers"} ({discounts?.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {!discounts || discounts.length === 0 ? (
              <Card className="text-center py-10">
                <p className="text-ink-muted">
                  {es
                    ? "Aún no has creado ninguna oferta."
                    : "You haven't created any offers yet."}
                </p>
              </Card>
            ) : (
              discounts.map((d) => (
                <Card key={d.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={d.is_active ? "brand" : "neutral"}>
                          {d.is_active
                            ? es
                              ? "Activa"
                              : "Active"
                            : es
                              ? "Pausada"
                              : "Paused"}
                        </Badge>
                        <span className="font-mono text-sm text-ink">
                          {d.discount_code}
                        </span>
                        <span className="text-lg font-semibold text-brand">
                          -{d.discount_percent}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-muted">
                        {d.description_es}
                      </p>
                      {d.description_en && (
                        <p className="text-sm text-ink-soft">{d.description_en}</p>
                      )}
                      {d.valid_until && (
                        <p className="mt-1 text-xs text-ink-soft">
                          {es ? "Válida hasta" : "Valid until"}:{" "}
                          {new Date(d.valid_until).toLocaleDateString(
                            es ? "es-ES" : "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </p>
                      )}
                    </div>
                    <PartnerDiscountActions
                      discountId={d.id}
                      isActive={d.is_active}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </PageShell>
    </DashboardShell>
  );
}
