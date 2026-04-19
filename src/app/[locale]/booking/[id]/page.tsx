import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Shield, Star } from "lucide-react";
import { DashboardShell, Avatar } from "@/components/ui";
import { BookingForm } from "@/components/booking-form";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: sitterProfile } = await supabase
    .from("sitter_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!sitterProfile) notFound();

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", id);

  const reviewCount = reviews?.length ?? 0;
  const avgRating = reviewCount > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : null;

  const es = locale === "es";

  const policyLabels: Record<string, { es: string; en: string }> = {
    flexible: { es: "Flexible — Reembolso completo hasta 24h antes", en: "Flexible — Full refund up to 24h before" },
    moderate: { es: "Moderada — Reembolso completo hasta 5 días antes", en: "Moderate — Full refund up to 5 days before" },
    strict: { es: "Estricta — 50% reembolso hasta 7 días antes", en: "Strict — 50% refund up to 7 days before" },
  };

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={myProfile?.full_name ?? ""}
      userRole={myProfile?.role ?? "owner"}
      avatarUrl={myProfile?.avatar_url}
    >
      <h1 className="text-2xl font-bold text-ink">
        {t("booking.title")}
      </h1>

      <div className="mt-6 rounded-2xl bg-surface border border-line p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">{profile.full_name}</p>
              {sitterProfile.is_verified && <Shield className="w-4 h-4 text-brand" />}
              {sitterProfile.has_insurance && <Shield className="w-4 h-4 text-ink-muted" />}
            </div>
            <p className="text-sm text-ink-muted">
              {Number(sitterProfile.hourly_rate).toFixed(0)}€ {t("sitter.perVisit")}
            </p>
            {avgRating !== null && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? "fill-current" : "text-ink-soft"}`} />
                  ))}
                </div>
                <span className="text-xs text-ink-muted">{avgRating.toFixed(1)} ({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
        {sitterProfile.cancellation_policy && (
          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-xs text-ink-soft">
              {es ? "Política de cancelación" : "Cancellation policy"}
            </p>
            <p className="text-sm text-ink-muted mt-0.5">
              {es
                ? policyLabels[sitterProfile.cancellation_policy as string]?.es
                : policyLabels[sitterProfile.cancellation_policy as string]?.en}
            </p>
          </div>
        )}
      </div>

      <BookingForm
        sitterId={id}
        sitterRate={Number(sitterProfile.hourly_rate)}
        services={sitterProfile.services as string[]}
        pets={pets ?? []}
      />
    </DashboardShell>
  );
}
