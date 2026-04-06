import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Header, PageShell, Card, Avatar, Badge, LinkButton } from "@/components/ui";

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

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, sitter:profiles!sitter_id(full_name), owner:profiles!owner_id(full_name), pet:pets(name)"
    )
    .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const isOwner = profile?.role === "owner" || profile?.role === "both";
  const isSitter = profile?.role === "sitter" || profile?.role === "both";

  const statusConfig: Record<string, { labelEs: string; labelEn: string; variant: "green" | "amber" | "red" | "blue" | "purple" | "stone" }> = {
    requested: { labelEs: "Solicitada", labelEn: "Requested", variant: "amber" },
    accepted: { labelEs: "Aceptada", labelEn: "Accepted", variant: "blue" },
    confirmed: { labelEs: "Confirmada", labelEn: "Confirmed", variant: "green" },
    in_progress: { labelEs: "En curso", labelEn: "In progress", variant: "purple" },
    completed: { labelEs: "Completada", labelEn: "Completed", variant: "stone" },
    cancelled: { labelEs: "Cancelada", labelEn: "Cancelled", variant: "red" },
    disputed: { labelEs: "En disputa", labelEn: "Disputed", variant: "red" },
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")}>
        <span className="text-sm text-stone-500">{profile?.full_name}</span>
        <form action="/api/auth/logout" method="POST">
          <button className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
            {t("common.logout")}
          </button>
        </form>
      </Header>

      <PageShell>
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <h1 className="text-2xl font-bold text-stone-900">
              {locale === "es" ? "Mi panel" : "My dashboard"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/dashboard/messages" variant="ghost" size="sm">
              💬 {locale === "es" ? "Mensajes" : "Messages"}
            </LinkButton>
            {isOwner && (
              <LinkButton href="/search" variant="primary" size="sm">
                🔍 {t("home.ctaOwner")}
              </LinkButton>
            )}
            <LinkButton
              href="/dashboard/sitter-setup"
              variant={isSitter ? "outline" : "ghost"}
              size="sm"
            >
              {isSitter
                ? locale === "es" ? "🐾 Mi perfil cuidador" : "🐾 Sitter profile"
                : locale === "es" ? "💚 Hazte cuidador" : "💚 Become a sitter"}
            </LinkButton>
          </div>
        </div>

        {/* Bookings list */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">
            {locale === "es" ? "Mis reservas" : "My bookings"}
          </h2>

          {!bookings || bookings.length === 0 ? (
            <Card className="mt-4 text-center py-12">
              <span className="text-4xl block mb-3">🐾</span>
              <p className="text-stone-400">
                {locale === "es"
                  ? "No tienes reservas todavia."
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
                            {(booking.pet as { name: string })?.name} —{" "}
                            {new Date(booking.start_date).toLocaleDateString(
                              locale === "es" ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                            {" → "}
                            {new Date(booking.end_date).toLocaleDateString(
                              locale === "es" ? "es-ES" : "en-GB",
                              { day: "numeric", month: "short" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:shrink-0">
                        <span className="text-sm font-semibold text-stone-900">
                          {Number(booking.total_amount)
                            .toFixed(2)
                            .replace(".", ",")} €
                        </span>
                        <Badge variant={config?.variant ?? "stone"}>
                          {locale === "es"
                            ? config?.labelEs ?? booking.status
                            : config?.labelEn ?? booking.status}
                        </Badge>
                        {(booking.status === "confirmed" ||
                          booking.status === "in_progress") && (
                          <LinkButton href={`/dashboard/booking/${booking.id}`} variant="primary" size="sm">
                            📍 {locale === "es" ? "Ver" : "View"}
                          </LinkButton>
                        )}
                        {booking.status === "completed" && (
                          <LinkButton href={`/dashboard/review/${booking.id}`} variant="outline" size="sm">
                            ⭐ {locale === "es" ? "Opinar" : "Review"}
                          </LinkButton>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}
