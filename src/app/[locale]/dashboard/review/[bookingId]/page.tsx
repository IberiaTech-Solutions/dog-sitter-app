import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ReviewForm } from "@/components/review-form";

type Props = {
  params: Promise<{ locale: string; bookingId: string }>;
};

export default async function ReviewPage({ params }: Props) {
  const { locale, bookingId } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, sitter:profiles!sitter_id(full_name), owner:profiles!owner_id(full_name)"
    )
    .eq("id", bookingId)
    .single();

  if (!booking || booking.status !== "completed") notFound();
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id) notFound();

  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", user.id)
    .single();

  const revieweeId =
    booking.owner_id === user.id ? booking.sitter_id : booking.owner_id;
  const revieweeName =
    booking.owner_id === user.id
      ? (booking.sitter as { full_name: string })?.full_name
      : (booking.owner as { full_name: string })?.full_name;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {locale === "es" ? "Dejar una opinión" : "Leave a review"}
        </h1>
        <p className="mt-2 text-zinc-500">
          {locale === "es"
            ? `¿Cómo fue tu experiencia con ${revieweeName}?`
            : `How was your experience with ${revieweeName}?`}
        </p>

        {existingReview ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-6 text-center">
            <p className="text-emerald-800">
              {locale === "es"
                ? "Ya has dejado una opinión para esta reserva."
                : "You've already reviewed this booking."}
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              {locale === "es" ? "Volver al panel" : "Back to dashboard"}
            </Link>
          </div>
        ) : (
          <ReviewForm
            bookingId={bookingId}
            revieweeId={revieweeId}
          />
        )}
      </main>
    </div>
  );
}
