import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { DiscountForm } from "@/components/discount-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDiscountsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase } = await requireAdmin(locale);
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
    <div className="min-h-screen bg-[#faf9f7]">
      <AdminHeader appName={t("common.appName")} locale={locale} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🏷️</span>
          <h1 className="text-2xl font-bold text-stone-900">
            {es ? "Descuentos de partners" : "Partner discounts"}
          </h1>
        </div>

        <AdminNav locale={locale} active="discounts" />

        {/* Add new discount form */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            {es ? "Añadir descuento" : "Add discount"}
          </h2>
          <DiscountForm />
        </div>

        {/* Existing discounts */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">
            {es ? "Descuentos activos" : "Active discounts"} ({discounts?.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {!discounts || discounts.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-stone-400">{es ? "No hay descuentos." : "No discounts yet."}</p>
              </Card>
            ) : (
              discounts.map((d) => (
                <Card key={d.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-900">{d.partner_name}</p>
                        <Badge variant={d.is_active ? "green" : "stone"}>
                          {d.is_active ? (es ? "Activo" : "Active") : (es ? "Inactivo" : "Inactive")}
                        </Badge>
                        <Badge variant="blue">
                          {es ? typeLabels[d.partner_type]?.es : typeLabels[d.partner_type]?.en}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-500 mt-1">{d.description_es}</p>
                      {d.description_en && (
                        <p className="text-sm text-stone-400">{d.description_en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm shrink-0">
                      <span className="text-stone-400">📍 {d.city}</span>
                      <span className="font-mono bg-stone-100 px-3 py-1 rounded-lg text-stone-700">{d.discount_code}</span>
                      <span className="text-lg font-bold text-green-600">-{d.discount_percent}%</span>
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
