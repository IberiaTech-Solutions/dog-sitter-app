import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { DashboardShell, Badge } from "@/components/ui";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

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
  const petName = (booking.pet as { name: string })?.name;
  const otherName = isSitter
    ? (booking.owner as { full_name: string })?.full_name
    : (booking.sitter as { full_name: string })?.full_name;

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      {/* Booking summary */}
      <div className="rounded-2xl bg-surface border border-line p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">
              {petName} · {otherName}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {new Date(booking.start_date).toLocaleDateString(
                locale === "es" ? "es-ES" : "en-GB"
              )}{" "}
              →{" "}
              {new Date(booking.end_date).toLocaleDateString(
                locale === "es" ? "es-ES" : "en-GB"
              )}
            </p>
          </div>
          <Badge variant="green">{booking.status}</Badge>
        </div>
      </div>

      <ActiveBookingView
        bookingId={id}
        isSitter={isSitter}
        initialLogs={visitLogs ?? []}
        bookingStatus={booking.status}
        sitterName={(booking.sitter as { full_name: string })?.full_name}
      />
    </DashboardShell>
  );
}
