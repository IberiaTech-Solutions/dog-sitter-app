import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, DashboardShell, PageShell, Badge } from "@/components/ui";
import { requirePartner } from "@/lib/partner";
import { PartnerRedemptionVerifier } from "@/components/partner-redemption-verifier";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; token?: string; ok?: string; error?: string }>;
};

export default async function PartnerRedemptionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale });
  const { supabase, profile, partnerProfile } = await requirePartner(locale);
  const es = locale === "es";

  if (!partnerProfile) {
    redirect(`/${locale}/partners/signup`);
  }

  // Partner's discount IDs (for filtering redemptions)
  const { data: myDiscounts } = await supabase
    .from("partner_discounts")
    .select("id, discount_code, description_es, discount_percent")
    .eq("partner_id", partnerProfile.id);

  const discountIds = (myDiscounts ?? []).map((d) => d.id);
  const discountMap = new Map((myDiscounts ?? []).map((d) => [d.id, d]));

  // Recent redemptions for partner's discounts
  const { data: redemptions } = discountIds.length === 0
    ? { data: [] }
    : await supabase
        .from("partner_discount_redemptions")
        .select("id, redemption_token, discount_id, status, issued_at, redeemed_at, expires_at")
        .in("discount_id", discountIds)
        .order("issued_at", { ascending: false })
        .limit(50);

  const statusBadge = (status: string): "brand" | "warning" | "danger" | "neutral" => {
    if (status === "redeemed") return "brand";
    if (status === "issued") return "warning";
    return "neutral";
  };

  const statusLabel = (status: string) => {
    if (status === "redeemed") return es ? "Canjeado" : "Redeemed";
    if (status === "issued") return es ? "Emitido" : "Issued";
    if (status === "expired") return es ? "Caducado" : "Expired";
    return es ? "Anulado" : "Void";
  };

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
            {es ? "Canjes" : "Redemptions"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {es
              ? "Introduce el código que te presenta el cliente para canjear su oferta."
              : "Enter the code the customer shows you to redeem their offer."}
          </p>
        </div>

        {/* Verifier */}
        <Card padding="lg" className="mt-6">
          <PartnerRedemptionVerifier
            initialToken={sp.token ?? ""}
            initialOk={sp.ok === "1"}
            initialError={sp.error}
          />
        </Card>

        {/* Recent redemptions */}
        <div className="mt-10">
          <h2 className="font-semibold text-ink">
            {es ? "Historial" : "History"} ({redemptions?.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {!redemptions || redemptions.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-ink-muted">
                  {es ? "Aún no hay canjes." : "No redemptions yet."}
                </p>
              </Card>
            ) : (
              redemptions.map((r) => {
                const d = discountMap.get(r.discount_id);
                return (
                  <Card key={r.id} padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusBadge(r.status)}>
                            {statusLabel(r.status)}
                          </Badge>
                          {d && (
                            <>
                              <span className="font-mono text-xs text-ink">
                                {d.discount_code}
                              </span>
                              <span className="text-sm font-semibold text-brand">
                                -{d.discount_percent}%
                              </span>
                            </>
                          )}
                        </div>
                        {d && (
                          <p className="mt-1 text-sm text-ink-muted">
                            {d.description_es}
                          </p>
                        )}
                        <p className="mt-1 text-xs font-mono text-ink-soft break-all">
                          {r.redemption_token}
                        </p>
                      </div>
                      <div className="text-xs text-ink-soft text-right shrink-0">
                        <p>
                          {es ? "Emitido" : "Issued"}:{" "}
                          {new Date(r.issued_at).toLocaleDateString(
                            es ? "es-ES" : "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </p>
                        {r.redeemed_at && (
                          <p>
                            {es ? "Canjeado" : "Redeemed"}:{" "}
                            {new Date(r.redeemed_at).toLocaleDateString(
                              es ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </PageShell>
    </DashboardShell>
  );
}
