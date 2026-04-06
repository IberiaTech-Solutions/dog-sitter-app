import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardShell, Card, Avatar, Badge, LinkButton } from "@/components/ui";
import { BookingActions } from "@/components/booking-actions";
import { PaymentToast } from "@/components/payment-toast";
import { ProfileCompletion } from "@/components/profile-completion";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect(`/${locale}/admin`);

  const isSitter = profile?.role === "sitter" || profile?.role === "both";
  const isOwnerRole = profile?.role === "owner" || profile?.role === "both";

  // Profile completion data
  const { count: petCount } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { data: sitterProfile } = isSitter
    ? await supabase.from("sitter_profiles").select("is_verified, has_insurance").eq("id", user.id).single()
    : { data: null };

  // Check if verifications are submitted (under review) — counts as "done" for completion
  const { data: verifications } = isSitter
    ? await supabase.from("verifications").select("type, status").eq("user_id", user.id).in("type", ["dni_nie", "sitter_insurance"])
    : { data: null };

  const dniStatus = verifications?.find((v) => v.type === "dni_nie")?.status;
  const insuranceStatus = verifications?.find((v) => v.type === "sitter_insurance")?.status;
  const dniDone: boolean | "in_review" = sitterProfile?.is_verified || dniStatus === "approved"
    ? true
    : dniStatus === "submitted"
      ? "in_review"
      : false;
  const insuranceDone: boolean | "in_review" = sitterProfile?.has_insurance || insuranceStatus === "approved"
    ? true
    : insuranceStatus === "submitted"
      ? "in_review"
      : false;

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, sitter:profiles!sitter_id(full_name), owner:profiles!owner_id(full_name), pet:pets(name)"
    )
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const isOwner = profile?.role === "owner";

  const statusConfig: Record<string, { labelEs: string; labelEn: string; variant: "green" | "amber" | "red" | "blue" | "purple" | "stone" }> = {
    pending_payment: { labelEs: "Procesando pago", labelEn: "Processing payment", variant: "stone" },
    requested: { labelEs: "Pendiente", labelEn: "Pending", variant: "amber" },
    confirmed: { labelEs: "Confirmada", labelEn: "Confirmed", variant: "green" },
    in_progress: { labelEs: "En curso", labelEn: "In progress", variant: "purple" },
    completed: { labelEs: "Completada", labelEn: "Completed", variant: "stone" },
    cancelled: { labelEs: "Cancelada", labelEn: "Cancelled", variant: "red" },
    disputed: { labelEs: "En disputa", labelEn: "Disputed", variant: "red" },
    meet_greet_requested: { labelEs: "Cita solicitada", labelEn: "Meet requested", variant: "blue" },
    meet_greet_accepted: { labelEs: "Cita aceptada", labelEn: "Meet accepted", variant: "green" },
    meet_greet_completed: { labelEs: "Cita completada", labelEn: "Meet completed", variant: "stone" },
  };

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <PaymentToast />

      <ProfileCompletion
        profile={{
          avatar_url: profile?.avatar_url ?? null,
          city: profile?.city ?? null,
          phone: profile?.phone ?? null,
          bio: profile?.bio ?? null,
          role: profile?.role ?? "owner",
        }}
        hasPets={(petCount ?? 0) > 0}
        hasSitterProfile={!!sitterProfile}
        isVerified={dniDone ?? false}
        hasInsurance={insuranceDone ?? false}
      />

      <h1 className="text-2xl font-bold text-stone-900">
        {locale === "es" ? "Mis reservas" : "My bookings"}
      </h1>

      {!bookings || bookings.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <p className="text-stone-400">
            {locale === "es"
              ? "No tienes reservas todavía."
              : "You don't have any bookings yet."}
          </p>
          {isOwner && (
            <LinkButton href="/search" variant="primary" size="md" className="mt-4">
              {t("home.ctaOwner")}
            </LinkButton>
          )}
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => {
            const otherPerson =
              booking.owner_id === user.id
                ? (booking.sitter as { full_name: string })
                : (booking.owner as { full_name: string });
            const config = statusConfig[booking.status];

            return (
              <Card key={booking.id} hover padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <Avatar name={otherPerson?.full_name ?? "?"} />
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-900 truncate">
                        {otherPerson?.full_name}
                      </p>
                      <p className="text-sm text-stone-400">
                        {booking.is_meet_greet ? (
                          booking.owner_notes
                            ? booking.owner_notes.length > 60
                              ? booking.owner_notes.slice(0, 60) + "..."
                              : booking.owner_notes
                            : (locale === "es" ? "Cita para conocerse" : "Meet & greet")
                        ) : (
                          <>
                            {(booking.pet as { name: string })?.name
                              ? `${(booking.pet as { name: string }).name} — `
                              : ""}
                            {new Date(booking.start_date).toLocaleDateString(
                              locale === "es" ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                            {" → "}
                            {new Date(booking.end_date).toLocaleDateString(
                              locale === "es" ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    {!booking.is_meet_greet && (
                      <span className="text-sm font-semibold text-stone-900">
                        {Number(booking.total_amount)
                          .toFixed(2)
                          .replace(".", ",")} €
                      </span>
                    )}
                    <Badge variant={config?.variant ?? "stone"}>
                      {locale === "es"
                        ? config?.labelEs ?? booking.status
                        : config?.labelEn ?? booking.status}
                    </Badge>
                    <BookingActions
                      bookingId={booking.id}
                      status={booking.status}
                      isSitter={booking.sitter_id === user.id}
                      isOwner={booking.owner_id === user.id}
                      otherPersonId={booking.owner_id === user.id ? booking.sitter_id : booking.owner_id}
                      sitterId={booking.sitter_id}
                      startDate={booking.start_date}
                      endDate={booking.end_date}
                      isMeetGreet={booking.is_meet_greet}
                    />
                    {(booking.status === "confirmed" ||
                      booking.status === "in_progress") && (
                      <LinkButton href={`/dashboard/booking/${booking.id}`} variant="primary" size="sm">
                        {locale === "es" ? "Ver visita" : "View visit"}
                      </LinkButton>
                    )}
                    {booking.status === "completed" && booking.owner_id === user.id && !booking.is_meet_greet && (
                      <>
                        <LinkButton href={`/booking/${booking.sitter_id}`} variant="primary" size="sm">
                          {locale === "es" ? "Repetir" : "Book again"}
                        </LinkButton>
                        <LinkButton href={`/dashboard/review/${booking.id}`} variant="outline" size="sm">
                          {locale === "es" ? "Opinar" : "Review"}
                        </LinkButton>
                      </>
                    )}
                    {booking.status === "completed" && booking.sitter_id === user.id && (
                      <LinkButton href={`/dashboard/review/${booking.id}`} variant="outline" size="sm">
                        {locale === "es" ? "Opinar" : "Review"}
                      </LinkButton>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
