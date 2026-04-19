import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, DashboardShell, PageShell, Badge } from "@/components/ui";
import { Briefcase, Globe, MapPin } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

async function issueRedemption(formData: FormData) {
  "use server";
  const discountId = formData.get("discountId");
  const locale = formData.get("locale");
  if (typeof discountId !== "string" || typeof locale !== "string") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "owner";
  const isOwner = role === "owner" || role === "both";
  const isSitter = role === "sitter" || role === "both";
  if (!isOwner && !isSitter) {
    redirect(`/${locale}/dashboard`);
  }

  // Generate signed token. Using crypto.randomUUID twice for ~256 bits of entropy.
  const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`.replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { data: inserted, error } = await supabase
    .from("partner_discount_redemptions")
    .insert({
      discount_id: discountId,
      redeemed_by_owner_id: isOwner ? user.id : null,
      redeemed_by_sitter_id: !isOwner && isSitter ? user.id : null,
      redemption_token: token,
      status: "issued",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[red-local] redemption insert failed:", error?.message);
    redirect(`/${locale}/dashboard/red-local?error=issue_failed`);
  }

  redirect(`/${locale}/dashboard/red-local/${inserted.id}`);
}

export default async function RedLocalPage({ params }: Props) {
  const { locale } = await params;
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

  // Partners have their own dashboard, shouldn't land here.
  if (profile?.role === "partner") redirect(`/${locale}/partner`);
  if (profile?.role === "admin") redirect(`/${locale}/admin`);

  // Verified partners with their active discounts.
  const { data: partners } = await supabase
    .from("partner_profiles")
    .select(`
      *,
      partner_discounts (id, discount_code, discount_percent, description_es, description_en, valid_until, is_active)
    `)
    .eq("is_verified", true)
    .order("city");

  const rows = (partners ?? []).flatMap((p) => {
    const activeDiscounts = (p.partner_discounts as { id: string; discount_code: string; discount_percent: number; description_es: string; description_en: string | null; valid_until: string | null; is_active: boolean }[] | null ?? []).filter((d) => d.is_active);
    return activeDiscounts.map((d) => ({ partner: p, discount: d }));
  });

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
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <PageShell>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
            {es ? "Red local · Gijón" : "Local network · Gijón"}
          </p>
          <h1 className="mt-3 font-serif text-h2 font-semibold text-ink">
            {es ? "Descuentos en el barrio." : "Neighborhood discounts."}
          </h1>
          <p className="mt-3 text-ink-muted max-w-2xl leading-relaxed">
            {es
              ? "Veterinarios, tiendas y peluquerías caninas de Gijón verificados por nosotros. Toca \"Usar\" para generar tu código y presentarlo en el negocio."
              : "Vets, pet shops, and groomers in Gijón — all verified. Tap \"Use\" to generate your code and present it at the shop."}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {rows.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-ink-muted">
                {es
                  ? "Aún no hay ofertas activas. Estamos cerrando partnerships en Gijón — vuelve pronto."
                  : "No active offers yet. We're closing partnerships in Gijón — check back soon."}
              </p>
            </Card>
          ) : (
            rows.map(({ partner, discount }) => (
              <Card key={discount.id} padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-brand-ink" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink">{partner.business_name}</p>
                        <Badge variant="neutral">{typeLabel(partner.business_type)}</Badge>
                        <span className="font-serif text-xl font-semibold text-brand">
                          -{discount.discount_percent}%
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        {es ? discount.description_es : discount.description_en ?? discount.description_es}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-ink-soft">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          {partner.city}
                        </span>
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-brand-ink transition-colors"
                          >
                            <Globe className="w-3 h-3" aria-hidden="true" />
                            {partner.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {discount.valid_until && (
                          <span>
                            {es ? "Hasta" : "Until"}{" "}
                            {new Date(discount.valid_until).toLocaleDateString(
                              es ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <form action={issueRedemption}>
                    <input type="hidden" name="discountId" value={discount.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 min-h-11 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
                    >
                      {es ? "Usar oferta" : "Use offer"}
                    </button>
                  </form>
                </div>
              </Card>
            ))
          )}
        </div>
      </PageShell>
    </DashboardShell>
  );
}
