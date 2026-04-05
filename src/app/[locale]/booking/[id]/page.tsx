import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BookingForm } from "@/components/booking-form";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  // Get sitter info
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

  // Get current user's pets
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pets } = user
    ? await supabase.from("pets").select("*").eq("owner_id", user.id)
    : { data: [] };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t("booking.title")}
        </h1>

        {/* Sitter summary */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-700">
              {profile.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-zinc-900">
                {profile.full_name}
              </p>
              <p className="text-sm text-zinc-500">
                {Number(sitterProfile.hourly_rate).toFixed(2).replace(".", ",")}{" "}
                € {t("sitter.perVisit")}
              </p>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="mt-6 rounded-xl bg-yellow-50 p-6 text-center">
            <p className="text-sm text-yellow-800">
              {locale === "es"
                ? "Inicia sesión para hacer una reserva."
                : "Please log in to make a booking."}
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t("common.login")}
            </Link>
          </div>
        ) : (
          <BookingForm
            sitterId={id}
            sitterRate={Number(sitterProfile.hourly_rate)}
            services={sitterProfile.services as string[]}
            pets={pets ?? []}
          />
        )}
      </main>
    </div>
  );
}
