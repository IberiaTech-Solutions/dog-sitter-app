import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase } = await requireAdmin(locale);
  const es = locale === "es";

  const { data: stats } = await supabase.rpc("admin_dashboard_stats");

  const statCards = [
    { icon: "👥", label: es ? "Usuarios" : "Users", value: stats?.total_users ?? 0 },
    { icon: "🐾", label: es ? "Cuidadores" : "Sitters", value: stats?.total_sitters ?? 0 },
    { icon: "🛡️", label: es ? "Verificados" : "Verified", value: stats?.verified_sitters ?? 0 },
    { icon: "⏳", label: es ? "Pendientes" : "Pending", value: stats?.pending_verifications ?? 0 },
    { icon: "📅", label: es ? "Reservas" : "Bookings", value: stats?.total_bookings ?? 0 },
    { icon: "📍", label: es ? "Activas" : "Active", value: stats?.active_bookings ?? 0 },
    { icon: "✅", label: es ? "Completadas" : "Completed", value: stats?.completed_bookings ?? 0 },
    { icon: "💰", label: es ? "Ingresos comisión" : "Commission revenue", value: `${Number(stats?.total_revenue ?? 0).toFixed(2).replace(".", ",")} €` },
    { icon: "💳", label: es ? "Pagos totales" : "Total payments", value: `${Number(stats?.total_payments ?? 0).toFixed(2).replace(".", ",")} €` },
    { icon: "🏷️", label: es ? "Descuentos activos" : "Active discounts", value: stats?.active_discounts ?? 0 },
    { icon: "⭐", label: es ? "Opiniones" : "Reviews", value: stats?.total_reviews ?? 0 },
    { icon: "📈", label: es ? "Puntuación media" : "Avg rating", value: stats?.avg_rating ?? "—" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AdminHeader appName={t("common.appName")} locale={locale} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-2xl font-bold text-stone-900">
            {es ? "Panel de administración" : "Admin dashboard"}
          </h1>
        </div>

        <AdminNav locale={locale} active="overview" />

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} padding="md">
              <span className="text-2xl">{stat.icon}</span>
              <p className="mt-2 text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-sm text-stone-400">{stat.label}</p>
            </Card>
          ))}
        </div>
      </PageShell>
    </div>
  );
}
