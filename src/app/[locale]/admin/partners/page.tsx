import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { AdminPartnerActions } from "@/components/admin-partner-actions";
import { PartnerDiscountActions } from "@/components/partner-discount-actions";
import { Briefcase, Globe, Phone, MapPin, Tag } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPartnersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, user, pendingVerifications, pendingPartners } = await requireAdmin(locale);
  const es = locale === "es";

  // Fetch partners + linked profile rows as two separate queries.
  // Avoids relying on PostgREST's FK-cache detection for partner_profiles.id→profiles.id,
  // which can lag behind schema changes and silently return empty results.
  const { data: partners, error: partnersError } = await supabase
    .from("partner_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (partnersError) {
    console.error("[admin/partners] fetch failed:", partnersError.message);
  }

  const partnerUserIds = (partners ?? []).map((p) => p.id);
  const { data: linkedProfiles } = partnerUserIds.length === 0
    ? { data: [] }
    : await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .in("id", partnerUserIds);

  const profileById = new Map(
    (linkedProfiles ?? []).map((p) => [p.id, p] as const)
  );

  // Fetch all discounts belonging to these partners, grouped by partner_id.
  const { data: allDiscounts } = partnerUserIds.length === 0
    ? { data: [] }
    : await supabase
        .from("partner_discounts")
        .select("id, partner_id, discount_code, discount_percent, description_es, description_en, is_active, valid_until")
        .in("partner_id", partnerUserIds)
        .order("created_at", { ascending: false });

  type DiscountRow = {
    id: string;
    partner_id: string | null;
    discount_code: string;
    discount_percent: number;
    description_es: string;
    description_en: string | null;
    is_active: boolean;
    valid_until: string | null;
  };

  const discountsByPartner = new Map<string, DiscountRow[]>();
  ((allDiscounts ?? []) as DiscountRow[]).forEach((d) => {
    if (!d.partner_id) return;
    const list = discountsByPartner.get(d.partner_id) ?? [];
    list.push(d);
    discountsByPartner.set(d.partner_id, list);
  });

  const pending = partners?.filter((p) => !p.is_verified) ?? [];
  const verified = partners?.filter((p) => p.is_verified) ?? [];

  const typeLabel = (type: string) => {
    const labels: Record<string, { es: string; en: string }> = {
      vet: { es: "Veterinario", en: "Vet" },
      pet_shop: { es: "Tienda", en: "Pet shop" },
      grooming: { es: "Peluquería", en: "Grooming" },
      trainer: { es: "Adiestrador", en: "Trainer" },
      nutritionist: { es: "Nutricionista", en: "Nutritionist" },
      other: { es: "Otro", en: "Other" },
    };
    return es ? labels[type]?.es ?? type : labels[type]?.en ?? type;
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader
        appName={t("common.appName")}
        locale={locale}
        userName={profile.full_name}
        avatarUrl={profile.avatar_url}
      />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-serif text-h2 font-semibold text-ink">
            {es ? "Partners" : "Partners"}
          </h1>
        </div>

        <AdminNav
          locale={locale}
          active="partners"
          pendingVerifications={pendingVerifications}
          pendingPartners={pendingPartners}
        />

        {/* Pending verifications */}
        {pending.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              {es ? "Verificaciones pendientes" : "Pending verifications"}
              <Badge variant="warning">{pending.length}</Badge>
            </h2>
            <div className="mt-4 space-y-3">
              {pending.map((p) => {
                const ownerProfile = profileById.get(p.id) ?? {
                  full_name: "—",
                  email: "—",
                  created_at: p.created_at,
                };
                return (
                  <Card key={p.id} padding="md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Briefcase
                          className="w-6 h-6 text-brand-ink shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-ink">{p.business_name}</p>
                            <Badge variant="neutral">{typeLabel(p.business_type)}</Badge>
                          </div>
                          <p className="text-sm text-ink-muted">
                            {ownerProfile?.full_name} · {ownerProfile?.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-ink-soft">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" aria-hidden="true" />
                              {p.city}
                              {p.postal_code ? ` · ${p.postal_code}` : ""}
                            </span>
                            {p.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3 h-3" aria-hidden="true" />
                                {p.phone}
                              </span>
                            )}
                            {p.website && (
                              <a
                                href={p.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:text-brand-ink transition-colors"
                              >
                                <Globe className="w-3 h-3" aria-hidden="true" />
                                {p.website.replace(/^https?:\/\//, "")}
                              </a>
                            )}
                            {p.tax_id && (
                              <span className="font-mono">{p.tax_id}</span>
                            )}
                          </div>
                          {p.description_es && (
                            <p className="mt-2 text-sm text-ink-muted max-w-2xl">
                              {p.description_es}
                            </p>
                          )}
                        </div>
                      </div>
                      <AdminPartnerActions
                        partnerId={p.id}
                        isVerified={false}
                        adminId={user.id}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified partners */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink">
            {es ? "Partners verificados" : "Verified partners"} ({verified.length})
          </h2>
          <div className="mt-4 space-y-3">
            {verified.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-ink-soft">
                  {es ? "Aún no hay partners verificados." : "No verified partners yet."}
                </p>
              </Card>
            ) : (
              verified.map((p) => {
                const ownerProfile = profileById.get(p.id) ?? {
                  full_name: "—",
                  email: "—",
                };
                const discounts = discountsByPartner.get(p.id) ?? [];
                return (
                  <Card key={p.id} padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Briefcase
                          className="w-6 h-6 text-brand-ink shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-ink truncate">{p.business_name}</p>
                            <Badge variant="brand">{es ? "Verificado" : "Verified"}</Badge>
                            <Badge variant="neutral">{typeLabel(p.business_type)}</Badge>
                          </div>
                          <p className="text-sm text-ink-soft truncate">
                            {p.city} · {ownerProfile?.email}
                          </p>
                        </div>
                      </div>
                      <AdminPartnerActions
                        partnerId={p.id}
                        isVerified={true}
                        adminId={user.id}
                      />
                    </div>

                    {/* Partner's discount offers — inline for admin oversight (Phase 0 — discount CRUD lives on /partner/discounts) */}
                    {discounts.length === 0 ? (
                      <p className="mt-3 pt-3 border-t border-line text-xs text-ink-soft italic">
                        {es ? "Sin ofertas activas." : "No active offers yet."}
                      </p>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-line">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted mb-3 flex items-center gap-1.5">
                          <Tag className="w-3 h-3" aria-hidden="true" />
                          {es ? "Ofertas" : "Offers"} ({discounts.length})
                        </p>
                        <div className="space-y-2">
                          {discounts.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-canvas"
                            >
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <Badge variant={d.is_active ? "brand" : "neutral"}>
                                  {d.is_active
                                    ? es
                                      ? "Activa"
                                      : "Active"
                                    : es
                                      ? "Pausada"
                                      : "Paused"}
                                </Badge>
                                <span className="font-mono text-xs text-ink">
                                  {d.discount_code}
                                </span>
                                <span className="text-sm font-semibold text-brand">
                                  -{d.discount_percent}%
                                </span>
                                <span className="text-sm text-ink-muted truncate">
                                  {d.description_es}
                                </span>
                              </div>
                              <PartnerDiscountActions
                                discountId={d.id}
                                isActive={d.is_active}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
