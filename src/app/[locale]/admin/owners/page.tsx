import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Avatar, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { AdminUserActions } from "@/components/admin-user-actions";
import { Dog, CalendarDays, Clock } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

type OwnerRow = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  city: string | null;
  role: string;
  created_at: string;
  pets: { id: string }[];
  bookings: { id: string; created_at: string }[];
};

export default async function AdminOwnersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, pendingVerifications } = await requireAdmin(locale);
  const es = locale === "es";

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, city, role, created_at, pets(id), bookings:bookings!owner_id(id, created_at)"
    )
    .in("role", ["owner", "both"])
    .order("created_at", { ascending: false });

  const owners = (data ?? []) as OwnerRow[];

  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader appName={t("common.appName")} locale={locale} userName={profile.full_name} avatarUrl={profile.avatar_url} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-serif text-h2 font-semibold text-ink">
            {es ? "Dueños" : "Owners"} ({owners.length})
          </h1>
        </div>

        <AdminNav locale={locale} active="owners" pendingVerifications={pendingVerifications} />

        <div className="mt-8 space-y-3">
          {owners.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-ink-soft">{es ? "Aún no hay dueños registrados." : "No owners registered yet."}</p>
            </Card>
          ) : (
            owners.map((owner) => {
              const petCount = owner.pets?.length ?? 0;
              const bookingCount = owner.bookings?.length ?? 0;
              const lastBookingAt = owner.bookings?.length
                ? owner.bookings.reduce((max, b) => (b.created_at > max ? b.created_at : max), owner.bookings[0].created_at)
                : null;

              return (
                <Card key={owner.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={owner.full_name || "?"} src={owner.avatar_url} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{owner.full_name || "—"}</p>
                          {owner.role === "both" && (
                            <Badge variant="brand">{es ? "También cuidador" : "Also sitter"}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-ink-soft">{owner.email}</p>
                        {owner.city && <p className="text-xs text-ink-soft mt-0.5">{owner.city}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-sm text-ink-muted">
                      <span className="flex items-center gap-1.5" title={es ? "Mascotas" : "Pets"}>
                        <Dog className="w-4 h-4 text-ink-soft" aria-hidden="true" />
                        {petCount}
                      </span>
                      <span className="flex items-center gap-1.5" title={es ? "Reservas" : "Bookings"}>
                        <CalendarDays className="w-4 h-4 text-ink-soft" aria-hidden="true" />
                        {bookingCount}
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-soft" title={es ? "Última reserva" : "Last booking"}>
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {lastBookingAt
                          ? new Date(lastBookingAt).toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "short" })
                          : (es ? "Nunca" : "Never")}
                      </span>
                      <AdminUserActions
                        userId={owner.id}
                        userName={owner.full_name || "?"}
                        currentRole={owner.role}
                      />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </PageShell>
    </div>
  );
}
