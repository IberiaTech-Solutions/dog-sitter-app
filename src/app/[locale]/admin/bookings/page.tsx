import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Avatar, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { AdminBookingActions } from "@/components/admin-booking-actions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBookingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, pendingVerifications } = await requireAdmin(locale);
  const es = locale === "es";

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "*, owner:profiles!owner_id(full_name, email), sitter:profiles!sitter_id(full_name, email), pet:pets(name, species)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

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
    <div className="min-h-screen bg-canvas">
      <AdminHeader appName={t("common.appName")} locale={locale} userName={profile.full_name} avatarUrl={profile.avatar_url} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-ink">
            {es ? "Todas las reservas" : "All bookings"}
          </h1>
        </div>

        <AdminNav locale={locale} active="bookings" pendingVerifications={pendingVerifications} />

        <div className="mt-8 space-y-3">
          {!bookings || bookings.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-ink-soft">{es ? "No hay reservas." : "No bookings yet."}</p>
            </Card>
          ) : (
            bookings.map((booking) => {
              const owner = booking.owner as unknown as { full_name: string; email: string };
              const sitter = booking.sitter as unknown as { full_name: string; email: string };
              const pet = booking.pet as unknown as { name: string; species: string };
              const config = statusConfig[booking.status];

              return (
                <Card key={booking.id} padding="md">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      {/* Owner */}
                      <div className="flex items-center gap-2">
                        <Avatar name={owner?.full_name ?? "?"} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-ink">{owner?.full_name}</p>
                          <p className="text-xs text-ink-soft">{es ? "Dueño" : "Owner"}</p>
                        </div>
                      </div>
                      <span className="text-ink-soft">→</span>
                      {/* Sitter */}
                      <div className="flex items-center gap-2">
                        <Avatar name={sitter?.full_name ?? "?"} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-ink">{sitter?.full_name}</p>
                          <p className="text-xs text-ink-soft">{es ? "Cuidador" : "Sitter"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {pet && (
                        <span className="text-ink-muted">
                          {pet.name}
                        </span>
                      )}
                      <span className="text-ink-soft">
                        {new Date(booking.start_date).toLocaleDateString(
                          es ? "es-ES" : "en-GB",
                          { day: "numeric", month: "short" }
                        )}
                      </span>
                      <span className="font-semibold text-ink">
                        {Number(booking.total_amount).toFixed(2).replace(".", ",")} €
                      </span>
                      <span className="text-xs text-ink-soft">
                        ({Number(booking.commission_amount).toFixed(2).replace(".", ",")} € {es ? "comisión" : "fee"})
                      </span>
                      <Badge variant={config?.variant ?? "stone"}>
                        {es ? config?.labelEs : config?.labelEn}
                      </Badge>
                      <AdminBookingActions bookingId={booking.id} currentStatus={booking.status} />
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
