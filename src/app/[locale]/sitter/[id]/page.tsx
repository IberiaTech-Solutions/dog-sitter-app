import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function SitterProfilePage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

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

  const serviceLabels: Record<string, Record<string, string>> = {
    es: {
      dog_walking: "Paseo de perros",
      pet_sitting: "Cuidado de mascotas",
      drop_in: "Visita a domicilio",
      overnight: "Estancia nocturna",
    },
    en: {
      dog_walking: "Dog walking",
      pet_sitting: "Pet sitting",
      drop_in: "Drop-in visit",
      overnight: "Overnight stay",
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Profile header */}
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900">
                  {profile.full_name}
                </h1>
                {sitterProfile.is_verified && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                    {t("sitter.verified")}
                  </span>
                )}
              </div>
              {profile.city && (
                <p className="mt-1 text-zinc-500">{profile.city}</p>
              )}
              {avgRating !== null && (
                <p className="mt-1 text-sm text-zinc-600">
                  {"★".repeat(Math.round(avgRating))} {avgRating.toFixed(1)} (
                  {reviews!.length} {t("sitter.reviews")})
                </p>
              )}
              <p className="mt-3 text-zinc-700">{profile.bio}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-900">
                {Number(sitterProfile.hourly_rate).toFixed(2).replace(".", ",")} €
              </p>
              <p className="text-sm text-zinc-500">{t("sitter.perVisit")}</p>
            </div>
          </div>

          {/* Services */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(sitterProfile.services as string[]).map((service: string) => (
              <span
                key={service}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700"
              >
                {serviceLabels[locale]?.[service] ?? service}
              </span>
            ))}
          </div>

          {/* Book button */}
          <div className="mt-8">
            <Link
              href={`/booking/${id}`}
              className="inline-block rounded-full bg-emerald-600 px-8 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t("sitter.bookNow")}
            </Link>
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900">
              {t("sitter.reviews")}
            </h2>
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium text-zinc-600">
                      {(review.reviewer as { full_name: string })?.full_name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {(review.reviewer as { full_name: string })?.full_name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {"★".repeat(review.rating)}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-zinc-600">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
