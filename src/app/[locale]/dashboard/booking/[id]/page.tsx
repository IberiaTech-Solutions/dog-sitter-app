import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ActiveBookingView } from "@/components/active-booking-view";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ActiveBookingPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, sitter:profiles!sitter_id(full_name), owner:profiles!owner_id(full_name), pet:pets(name, species)"
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();
  if (booking.owner_id !== user.id && booking.sitter_id !== user.id) notFound();

  const { data: visitLogs } = await supabase
    .from("visit_logs")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false });

  const isSitter = booking.sitter_id === user.id;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            {locale === "es" ? "Mi panel" : "Dashboard"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Booking summary */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                {(booking.pet as { name: string })?.name} —{" "}
                {isSitter
                  ? (booking.owner as { full_name: string })?.full_name
                  : (booking.sitter as { full_name: string })?.full_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {new Date(booking.start_date).toLocaleDateString(
                  locale === "es" ? "es-ES" : "en-GB"
                )}{" "}
                →{" "}
                {new Date(booking.end_date).toLocaleDateString(
                  locale === "es" ? "es-ES" : "en-GB"
                )}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              {booking.status}
            </span>
          </div>
        </div>

        <ActiveBookingView
          bookingId={id}
          isSitter={isSitter}
          initialLogs={visitLogs ?? []}
          bookingStatus={booking.status}
        />
      </main>
    </div>
  );
}
