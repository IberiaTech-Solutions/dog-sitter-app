import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Shield, Star, MapPin, Clock, Dog, Cat, Bird, Rabbit, PawPrint } from "lucide-react";
import { Header, PageShell, Card, Avatar, Badge, LinkButton } from "@/components/ui";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { MeetGreetButton } from "@/components/meet-greet-button";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const speciesIcons: Record<string, typeof Dog> = { dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit };
const serviceLabels: Record<string, Record<string, string>> = {
  es: { dog_walking: "Paseo de perros", pet_sitting: "Cuidado de mascotas", drop_in: "Visita a domicilio", overnight: "Estancia nocturna" },
  en: { dog_walking: "Dog walking", pet_sitting: "Pet sitting", drop_in: "Drop-in visit", overnight: "Overnight stay" },
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

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn={!!user}>
        {user ? (
          <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
            {es ? "Mi panel" : "Dashboard"}
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
            {t("common.login")}
          </Link>
        )}
      </Header>

      <PageShell maxWidth="lg">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header */}
            <Card padding="lg">
              <div className="flex items-start gap-5">
                <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-stone-900">
                      {profile.full_name}
                    </h1>
                    {sitterProfile.is_verified && (
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200/60 rounded-full px-3 py-1">
                        <Shield className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          {t("sitter.verified")}
                        </span>
                      </div>
                    )}
                  </div>
                  {profile.city && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-stone-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.city}
                    </div>
                  )}
                  {avgRating !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-current" : "text-stone-200"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-stone-700">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-stone-400">({reviews!.length} {t("sitter.reviews")})</span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="mt-4 text-stone-600 leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card padding="lg">
              <h2 className="font-semibold text-stone-900 mb-4">
                {es ? "Servicios" : "Services"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(sitterProfile.services as string[]).map((service: string) => (
                  <Badge key={service} variant="green" className="px-3.5 py-1.5 text-sm">
                    {serviceLabels[locale]?.[service] ?? service}
                  </Badge>
                ))}
              </div>

              <h3 className="font-medium text-stone-700 mt-6 mb-3">
                {es ? "Tipos de mascotas" : "Pet types"}
              </h3>
              <div className="flex gap-3">
                {(sitterProfile.pet_types as string[]).map((pet: string) => {
                  const Icon = speciesIcons[pet] ?? PawPrint;
                  return (
                    <div key={pet} className="flex items-center gap-2 bg-stone-50 rounded-xl px-4 py-2.5">
                      <Icon className="w-5 h-5 text-stone-500" />
                      <span className="text-sm text-stone-700 capitalize">{pet}</span>
                    </div>
                  );
                })}
              </div>

              {sitterProfile.experience_years && (
                <div className="flex items-center gap-2 mt-6 text-sm text-stone-500">
                  <Clock className="w-4 h-4" />
                  {sitterProfile.experience_years} {es ? "años de experiencia" : "years experience"}
                </div>
              )}

              {/* Response stats */}
              {responseStats && (responseStats as { total_requests: number }).total_requests > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {(responseStats as { response_rate: number }).response_rate}%
                    </p>
                    <p className="text-xs text-stone-400">
                      {es ? "Tasa de respuesta" : "Response rate"}
                    </p>
                  </div>
                  {(responseStats as { avg_response_minutes: number }).avg_response_minutes > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-stone-900">
                        {(responseStats as { avg_response_minutes: number }).avg_response_minutes < 60
                          ? `${(responseStats as { avg_response_minutes: number }).avg_response_minutes} min`
                          : `${Math.round((responseStats as { avg_response_minutes: number }).avg_response_minutes / 60)}h`}
                      </p>
                      <p className="text-xs text-stone-400">
                        {es ? "Tiempo de respuesta" : "Response time"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Cancellation policy */}
            {sitterProfile.cancellation_policy && (
              <Card padding="md">
                <p className="text-sm font-medium text-stone-700">
                  {es ? "Política de cancelación" : "Cancellation policy"}
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  {{
                    flexible: es
                      ? "Flexible — Reembolso completo hasta 24h antes del inicio"
                      : "Flexible — Full refund up to 24h before start",
                    moderate: es
                      ? "Moderada — Reembolso completo hasta 5 días antes, 50% después"
                      : "Moderate — Full refund up to 5 days before, 50% after",
                    strict: es
                      ? "Estricta — 50% reembolso hasta 7 días antes, sin reembolso después"
                      : "Strict — 50% refund up to 7 days before, no refund after",
                  }[sitterProfile.cancellation_policy as string] ?? sitterProfile.cancellation_policy}
                </p>
              </Card>
            )}

            {/* Availability */}
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-4">
                {es ? "Disponibilidad" : "Availability"}
              </h2>
              <AvailabilityCalendar sitterId={id} isEditable={false} />
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-stone-900 mb-4">
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
                              <p className="text-sm font-medium text-stone-900">
                                {reviewer?.full_name}
                              </p>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-stone-200"}`} />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-stone-400">
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
              <Card padding="lg" className="border-green-100">
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-900">
                    {Number(sitterProfile.hourly_rate).toFixed(0)}€
                  </p>
                  <p className="text-sm text-stone-400 mt-1">{t("sitter.perVisit")}</p>
                </div>

                {avgRating !== null && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-current" : "text-stone-200"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-stone-600">{avgRating.toFixed(1)} ({reviews!.length})</span>
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

                {sitterProfile.is_verified && (
                  <div className="mt-4 flex items-center gap-2 justify-center text-xs text-green-700">
                    <Shield className="w-3.5 h-3.5" />
                    {es ? "Identidad y antecedentes verificados" : "Identity and background verified"}
                  </div>
                )}
              </Card>

              {/* Guarantee mini */}
              <div className="mt-4 rounded-2xl bg-green-50 border border-green-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">{t("home.guarantee")}</span>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  {t("home.guaranteeDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
