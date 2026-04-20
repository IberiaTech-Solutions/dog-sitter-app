import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Shield, Star, MapPin, Clock, Dog, Cat, Bird, Rabbit, PawPrint } from "lucide-react";
import { Header, Card, Avatar, Badge, LinkButton, DashboardShell, PageShell } from "@/components/ui";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { MeetGreetButton } from "@/components/meet-greet-button";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const speciesIcons: Record<string, typeof Dog> = { dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit };
const serviceLabels: Record<string, Record<string, string>> = {
  es: { dog_walking: "Paseo de perros", pet_sitting: "Cuidado de mascotas", drop_in: "Visita a domicilio", overnight: "Estancia nocturna", daycare: "Guardería de día" },
  en: { dog_walking: "Dog walking", pet_sitting: "Pet sitting", drop_in: "Drop-in visit", overnight: "Overnight stay", daycare: "Daycare" },
};

export default async function SitterProfilePage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const es = locale === "es";
  const { data: { user } } = await supabase.auth.getUser();

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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(full_name, avatar_url)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const { data: responseStats } = await supabase.rpc("sitter_response_stats", {
    sitter_uuid: id,
  });

  // Count repeat clients (owners who booked more than once)
  const { data: repeatData } = await supabase
    .from("bookings")
    .select("owner_id")
    .eq("sitter_id", id)
    .eq("status", "completed");

  const ownerCounts: Record<string, number> = {};
  repeatData?.forEach((b) => { ownerCounts[b.owner_id] = (ownerCounts[b.owner_id] || 0) + 1; });
  const repeatClients = Object.values(ownerCounts).filter((c) => c > 1).length;

  // Fetch logged-in user's profile for DashboardShell
  const { data: myProfile } = user
    ? await supabase.from("profiles").select("full_name, role, avatar_url").eq("id", user.id).single()
    : { data: null };

  const content = (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header */}
            <Card padding="lg">
              <div className="flex items-start gap-5">
                <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="font-serif text-h2 font-semibold text-ink">
                      {profile.full_name}
                    </h1>
                    {sitterProfile.is_verified && (
                      <div className="flex items-center gap-1.5 bg-brand-soft border border-brand/40 rounded-full px-3 py-1">
                        <Shield className="w-3.5 h-3.5 text-brand" />
                        <span className="text-xs font-medium text-brand-ink">
                          {t("sitter.verified")}
                        </span>
                      </div>
                    )}
                    {sitterProfile.has_insurance && (
                      <div className="flex items-center gap-1.5 bg-line/40 border border-line rounded-full px-3 py-1">
                        <Shield className="w-3.5 h-3.5 text-ink-muted" />
                        <span className="text-xs font-medium text-ink">
                          {es ? "Asegurado" : "Insured"}
                        </span>
                      </div>
                    )}
                  </div>
                  {profile.city && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-ink-muted">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.city}
                    </div>
                  )}
                  {avgRating !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-warning">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-current" : "text-ink-soft"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-ink">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-ink-soft">({reviews!.length} {t("sitter.reviews")})</span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="mt-4 text-ink-muted leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card padding="lg">
              <h2 className="font-semibold text-ink mb-4">
                {es ? "Servicios" : "Services"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(sitterProfile.services as string[]).map((service: string) => (
                  <Badge key={service} variant="green" className="px-3.5 py-1.5 text-sm">
                    {serviceLabels[locale]?.[service] ?? service}
                  </Badge>
                ))}
              </div>

              <h3 className="font-medium text-ink mt-6 mb-3">
                {es ? "Tipos de mascotas" : "Pet types"}
              </h3>
              <div className="flex gap-3">
                {(sitterProfile.pet_types as string[]).map((pet: string) => {
                  const Icon = speciesIcons[pet] ?? PawPrint;
                  return (
                    <div key={pet} className="flex items-center gap-2 bg-canvas rounded-xl px-4 py-2.5">
                      <Icon className="w-5 h-5 text-ink-muted" />
                      <span className="text-sm text-ink capitalize">{pet}</span>
                    </div>
                  );
                })}
              </div>

              {sitterProfile.experience_years && (
                <div className="flex items-center gap-2 mt-6 text-sm text-ink-muted">
                  <Clock className="w-4 h-4" />
                  {sitterProfile.experience_years} {es ? "años de experiencia" : "years experience"}
                </div>
              )}

              {/* Response stats + repeat clients */}
              {(responseStats && (responseStats as { total_requests: number }).total_requests > 0) || repeatClients > 0 ? (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-line">
                  {responseStats && (responseStats as { total_requests: number }).total_requests > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand">
                        {(responseStats as { response_rate: number }).response_rate}%
                      </p>
                      <p className="text-xs text-ink-soft">
                        {es ? "Tasa de respuesta" : "Response rate"}
                      </p>
                    </div>
                  )}
                  {responseStats && (responseStats as { avg_response_minutes: number }).avg_response_minutes > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">
                        {(responseStats as { avg_response_minutes: number }).avg_response_minutes < 60
                          ? `${(responseStats as { avg_response_minutes: number }).avg_response_minutes} min`
                          : `${Math.round((responseStats as { avg_response_minutes: number }).avg_response_minutes / 60)}h`}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {es ? "Tiempo de respuesta" : "Response time"}
                      </p>
                    </div>
                  )}
                  {repeatClients > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{repeatClients}</p>
                      <p className="text-xs text-ink-soft">
                        {es ? "Clientes que repiten" : "Repeat clients"}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Home details */}
              {(sitterProfile.home_type || sitterProfile.has_own_pets) && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-line">
                  {sitterProfile.home_type && (
                    <span className="text-xs bg-canvas text-ink-muted px-3 py-1.5 rounded-full">
                      {sitterProfile.home_type === "house" ? (es ? "Casa" : "House") : (es ? "Piso" : "Apartment")}
                    </span>
                  )}
                  {sitterProfile.has_yard && (
                    <span className="text-xs bg-brand-soft text-brand px-3 py-1.5 rounded-full">
                      {es ? "Con jardín" : "Has yard"}
                    </span>
                  )}
                  {sitterProfile.has_children && (
                    <span className="text-xs bg-warning/10 text-warning-ink px-3 py-1.5 rounded-full">
                      {es ? "Niños en casa" : "Children at home"}
                    </span>
                  )}
                  {sitterProfile.has_own_pets && (
                    <span className="text-xs bg-line/40 text-ink-muted px-3 py-1.5 rounded-full">
                      {sitterProfile.has_own_pets}
                    </span>
                  )}
                </div>
              )}
            </Card>

            {/* Cancellation policy */}
            {sitterProfile.cancellation_policy && (
              <Card padding="md">
                <p className="text-sm font-medium text-ink">
                  {es ? "Política de cancelación" : "Cancellation policy"}
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  {{
                    flexible: es
                      ? "Flexible: reembolso completo hasta 24h antes del inicio"
                      : "Flexible: full refund up to 24h before start",
                    moderate: es
                      ? "Moderada: reembolso completo hasta 5 días antes, 50% después"
                      : "Moderate: full refund up to 5 days before, 50% after",
                    strict: es
                      ? "Estricta: 50% reembolso hasta 7 días antes, sin reembolso después"
                      : "Strict: 50% refund up to 7 days before, no refund after",
                  }[sitterProfile.cancellation_policy as string] ?? sitterProfile.cancellation_policy}
                </p>
              </Card>
            )}

            {/* Availability */}
            <div>
              <h2 className="text-lg font-semibold text-ink mb-4">
                {es ? "Disponibilidad" : "Availability"}
              </h2>
              <AvailabilityCalendar sitterId={id} isEditable={false} />
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-ink mb-4">
                  {t("sitter.reviews")} ({reviews.length})
                </h2>
                <div className="space-y-3">
                  {reviews.map((review) => {
                    const reviewer = review.reviewer as unknown as { full_name: string; avatar_url: string | null };
                    return (
                      <Card key={review.id} padding="md">
                        <div className="flex items-start gap-3">
                          <Avatar name={reviewer?.full_name ?? "?"} src={reviewer?.avatar_url} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-ink">
                                {reviewer?.full_name}
                              </p>
                              <div className="flex text-warning">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-ink-soft"}`} />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-ink-soft">
                              {new Date(review.created_at).toLocaleDateString(
                                es ? "es-ES" : "en-GB",
                                { day: "numeric", month: "long", year: "numeric" }
                              )}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar — booking card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Card padding="lg" className="border-brand-soft">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ink">
                    {Number(sitterProfile.hourly_rate).toFixed(0)}€
                  </p>
                  <p className="text-sm text-ink-soft mt-1">{t("sitter.perVisit")}</p>
                </div>

                {avgRating !== null && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-current" : "text-ink-soft"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-ink-muted">{avgRating.toFixed(1)} ({reviews!.length})</span>
                  </div>
                )}

                <LinkButton href={`/booking/${id}`} variant="primary" size="lg" className="w-full mt-6">
                  {t("sitter.bookNow")}
                </LinkButton>

                {user && (
                  <div className="mt-3">
                    <MeetGreetButton sitterId={id} sitterName={profile.full_name} />
                  </div>
                )}

                {(sitterProfile.is_verified || sitterProfile.has_insurance) && (
                  <div className="mt-4 space-y-1.5">
                    {sitterProfile.is_verified && (
                      <div className="flex items-center gap-2 justify-center text-xs text-brand-ink">
                        <Shield className="w-3.5 h-3.5" />
                        {es ? "Identidad verificada" : "Identity verified"}
                      </div>
                    )}
                    {sitterProfile.has_insurance && (
                      <div className="flex items-center gap-2 justify-center text-xs text-ink">
                        <Shield className="w-3.5 h-3.5" />
                        {es ? "Seguro de responsabilidad civil" : "Liability insurance"}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Guarantee mini */}
              <div className="mt-4 rounded-2xl bg-brand-soft border border-brand-soft p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold text-brand-ink">{t("home.guarantee")}</span>
                </div>
                <p className="text-xs text-brand-ink leading-relaxed">
                  {t("home.guaranteeDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
  );

  if (user && myProfile) {
    return (
      <DashboardShell
        appName={t("common.appName")}
        locale={locale}
        userName={myProfile.full_name}
        userRole={myProfile.role}
        avatarUrl={myProfile.avatar_url}
      >
        {content}
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Header appName={t("common.appName")} isLoggedIn={false}>
        <Link href="/login" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
          {t("common.login")}
        </Link>
      </Header>
      <PageShell maxWidth="lg">
        {content}
      </PageShell>
    </div>
  );
}
