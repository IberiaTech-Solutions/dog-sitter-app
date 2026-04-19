import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { DiscountForm } from "@/components/discount-form";
import { AdminDiscountActions } from "@/components/admin-discount-actions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDiscountsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, pendingVerifications } = await requireAdmin(locale);
  const es = locale === "es";

  const { data: discounts } = await supabase
    .from("partner_discounts")
    .select("*")
    .order("created_at", { ascending: false });

  const typeLabels: Record<string, { es: string; en: string }> = {
    vet: { es: "Veterinario", en: "Vet" },
    pet_shop: { es: "Tienda", en: "Pet shop" },
    grooming: { es: "Peluquería", en: "Grooming" },
    other: { es: "Otro", en: "Other" },
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader appName={t("common.appName")} locale={locale} userName={profile.full_name} avatarUrl={profile.avatar_url} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-ink">
            {es ? "Descuentos de partners" : "Partner discounts"}
          </h1>
        </div>

        <AdminNav locale={locale} active="discounts" pendingVerifications={pendingVerifications} />

        {/* Add new discount form */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink mb-4">
            {es ? "Añadir descuento" : "Add discount"}
          </h2>
          <DiscountForm />
        </div>

        {/* Existing discounts */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink">
            {es ? "Descuentos activos" : "Active discounts"} ({discounts?.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {!discounts || discounts.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-ink-soft">{es ? "No hay descuentos." : "No discounts yet."}</p>
              </Card>
            ) : (
              discounts.map((d) => (
                <Card key={d.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{d.partner_name}</p>
                        <Badge variant={d.is_active ? "green" : "stone"}>
                          {d.is_active ? (es ? "Activo" : "Active") : (es ? "Inactivo" : "Inactive")}
                        </Badge>
                        <Badge variant="blue">
                          {es ? typeLabels[d.partner_type]?.es : typeLabels[d.partner_type]?.en}
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-muted mt-1">{d.description_es}</p>
                      {d.description_en && (
                        <p className="text-sm text-ink-soft">{d.description_en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm shrink-0">
                      <span className="text-ink-soft">{d.city}</span>
                      <span className="font-mono bg-line/50 px-3 py-1 rounded-lg text-ink">{d.discount_code}</span>
                      <span className="text-lg font-bold text-brand">-{d.discount_percent}%</span>
                      <AdminDiscountActions discountId={d.id} isActive={d.is_active} partnerName={d.partner_name} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
