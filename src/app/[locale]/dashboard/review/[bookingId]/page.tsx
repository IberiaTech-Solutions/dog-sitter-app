import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { DashboardShell, LinkButton } from "@/components/ui";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, sitter:profiles!sitter_id(full_name), owner:profiles!owner_id(full_name)"
    )
    .eq("id", bookingId)
    .single();

  if (!booking || booking.status !== "completed") notFound();
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id) notFound();

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
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-stone-900">
          {locale === "es" ? "Dejar una opinión" : "Leave a review"}
        </h1>
        <p className="mt-1 text-stone-500">
          {locale === "es"
            ? `¿Cómo fue tu experiencia con ${revieweeName}?`
            : `How was your experience with ${revieweeName}?`}
        </p>

        {existingReview ? (
          <div className="mt-6 rounded-2xl bg-green-50 border border-green-100 p-6 text-center">
            <p className="text-green-800">
              {locale === "es"
                ? "Ya has dejado una opinión para esta reserva."
                : "You've already reviewed this booking."}
            </p>
            <LinkButton href="/dashboard" variant="ghost" size="sm" className="mt-3">
              {locale === "es" ? "Volver al panel" : "Back to dashboard"}
            </LinkButton>
          </div>
        ) : (
          <ReviewForm bookingId={bookingId} revieweeId={revieweeId} />
        )}
      </div>
    </DashboardShell>
  );
}
