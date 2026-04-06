import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Avatar, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { AdminSitterActions } from "@/components/admin-sitter-actions";
import { AdminUserActions } from "@/components/admin-user-actions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSittersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, pendingVerifications } = await requireAdmin(locale);
  const es = locale === "es";

  const { data: sitters } = await supabase
    .from("sitter_profiles")
    .select("*, profile:profiles!id(full_name, email, city, created_at)")
    .order("created_at", { ascending: false });

  const { data: pendingVerificationsList } = await supabase
    .from("verifications")
    .select("*, user:profiles!user_id(full_name, email)")
    .in("status", ["pending", "submitted"])
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AdminHeader appName={t("common.appName")} locale={locale} userName={profile.full_name} avatarUrl={profile.avatar_url} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            {es ? "Gestión de cuidadores" : "Sitter management"}
          </h1>
        </div>

        <AdminNav locale={locale} active="sitters" pendingVerifications={pendingVerifications} />

        {/* Pending verifications */}
        {pendingVerificationsList && pendingVerificationsList.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              {es ? "Verificaciones pendientes" : "Pending verifications"}
              <Badge variant="amber">{pendingVerificationsList.length}</Badge>
            </h2>
            <div className="mt-4 space-y-3">
              {pendingVerificationsList.map((v) => (
                <Card key={v.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={(v.user as unknown as { full_name: string })?.full_name ?? "?"} />
                      <div>
                        <p className="font-semibold text-stone-900">
                          {(v.user as unknown as { full_name: string })?.full_name}
                        </p>
                        <p className="text-sm text-stone-400">
                          {(v.user as unknown as { email: string })?.email}
                        </p>
                        <p className="text-xs text-stone-400">
                          {v.type === "dni_nie" ? "DNI/NIE" : v.type === "sitter_insurance" ? (es ? "Seguro RC" : "Insurance") : v.type === "background_check" ? (es ? "Antecedentes" : "Background") : v.type}
                        </p>
                      </div>
                    </div>
                    <AdminSitterActions
                      verificationId={v.id}
                      userId={v.user_id}
                      verificationType={v.type}
                      documentPath={v.document_url}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All sitters */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">
            {es ? "Todos los cuidadores" : "All sitters"} ({sitters?.length ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {!sitters || sitters.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-stone-400">
                  {es ? "No hay cuidadores registrados." : "No sitters registered yet."}
                </p>
              </Card>
            ) : (
              sitters.map((sitter) => {
                const profile = sitter.profile as unknown as {
                  full_name: string;
                  email: string;
                  city: string | null;
                };
                return (
                  <Card key={sitter.id} padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={profile?.full_name ?? "?"} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-stone-900">{profile?.full_name}</p>
                            {sitter.is_verified ? (
                              <Badge variant="green">{es ? "Verificado" : "Verified"}</Badge>
                            ) : (
                              <Badge variant="amber">{es ? "Sin verificar" : "Unverified"}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-stone-400">{profile?.email}</p>
                          {profile?.city && (
                            <p className="text-xs text-stone-400">{profile.city}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="font-semibold text-stone-900">
                            {Number(sitter.hourly_rate).toFixed(0)}€
                          </p>
                          <p className="text-xs text-stone-400">{es ? "por visita" : "per visit"}</p>
                        </div>
                        <Badge variant={sitter.is_available ? "green" : "stone"}>
                          {sitter.is_available ? (es ? "Disponible" : "Available") : (es ? "No disponible" : "Unavailable")}
                        </Badge>
                        <AdminUserActions
                          userId={sitter.id}
                          userName={profile?.full_name ?? "?"}
                          currentRole="sitter"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </PageShell>
    </div>
  );
}
