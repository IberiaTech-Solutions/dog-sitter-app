import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";

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

  // Get user's bookings (as owner or sitter)
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

  const statusLabels: Record<string, Record<string, string>> = {
    es: {
      requested: "Solicitada",
      accepted: "Aceptada",
      confirmed: "Confirmada",
      in_progress: "En curso",
      completed: "Completada",
      cancelled: "Cancelada",
      disputed: "En disputa",
    },
    en: {
      requested: "Requested",
      accepted: "Accepted",
      confirmed: "Confirmed",
      in_progress: "In progress",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    },
  };

  const statusColors: Record<string, string> = {
    requested: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-zinc-100 text-zinc-800",
    cancelled: "bg-red-100 text-red-800",
    disputed: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">
              {profile?.full_name}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button className="text-sm text-zinc-500 hover:text-zinc-700">
                {t("common.logout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">
            {locale === "es" ? "Mi panel" : "My dashboard"}
          </h1>
          <div className="flex gap-3">
            <Link
              href="/dashboard/messages"
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {locale === "es" ? "Mensajes" : "Messages"}
            </Link>
            {isOwner && (
              <Link
                href="/search"
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {t("home.ctaOwner")}
              </Link>
            )}
            {isSitter && (
              <Link
                href="/dashboard/sitter-setup"
                className="rounded-full border border-emerald-600 px-5 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
              >
                {locale === "es" ? "Mi perfil cuidador" : "Sitter profile"}
              </Link>
            )}
            {!isSitter && (
              <Link
                href="/dashboard/sitter-setup"
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {locale === "es" ? "Hazte cuidador" : "Become a sitter"}
              </Link>
            )}
          </div>
        </div>

        {/* Bookings list */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            {locale === "es" ? "Mis reservas" : "My bookings"}
          </h2>

          {!bookings || bookings.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              {locale === "es"
                ? "No tienes reservas todavía."
                : "You don't have any bookings yet."}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => {
                const otherPerson =
                  booking.owner_id === user.id
                    ? (booking.sitter as { full_name: string })
                    : (booking.owner as { full_name: string });

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                        {otherPerson?.full_name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          {otherPerson?.full_name}
                        </p>
                        <p className="text-sm text-zinc-500">
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
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-zinc-900">
                        {Number(booking.total_amount)
                          .toFixed(2)
                          .replace(".", ",")}{" "}
                        €
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[booking.status] ?? "bg-zinc-100 text-zinc-600"}`}
                      >
                        {statusLabels[locale]?.[booking.status] ??
                          booking.status}
                      </span>
                      {(booking.status === "confirmed" ||
                        booking.status === "in_progress") && (
                        <Link
                          href={`/dashboard/booking/${booking.id}`}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          {locale === "es" ? "Ver visita" : "View visit"}
                        </Link>
                      )}
                      {booking.status === "completed" && (
                        <Link
                          href={`/dashboard/review/${booking.id}`}
                          className="rounded-full border border-emerald-600 px-4 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                        >
                          {locale === "es" ? "Opinar" : "Review"}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
