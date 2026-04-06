import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "next-intl/server";
import { PageShell, Card, Avatar, Badge } from "@/components/ui";
import { AdminHeader } from "@/components/admin-header";
import { AdminNav } from "@/components/admin-nav";
import { AdminUserActions } from "@/components/admin-user-actions";
import { AdminInviteForm } from "@/components/admin-invite-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const { supabase, profile, pendingVerifications } = await requireAdmin(locale);
  const es = locale === "es";

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const roleConfig: Record<string, { labelEs: string; labelEn: string; variant: "green" | "amber" | "blue" | "red" | "purple" | "stone" }> = {
    owner: { labelEs: "Dueño", labelEn: "Owner", variant: "blue" },
    sitter: { labelEs: "Cuidador", labelEn: "Sitter", variant: "green" },
    admin: { labelEs: "Admin", labelEn: "Admin", variant: "red" },
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AdminHeader appName={t("common.appName")} locale={locale} userName={profile.full_name} avatarUrl={profile.avatar_url} />

      <PageShell>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            {es ? "Todos los usuarios" : "All users"} ({users?.length ?? 0})
          </h1>
        </div>

        <AdminNav locale={locale} active="users" pendingVerifications={pendingVerifications} />

        <div className="mt-8 max-w-md">
          <AdminInviteForm />
        </div>

        <div className="mt-8 space-y-3">
          {!users || users.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-stone-400">{es ? "No hay usuarios." : "No users yet."}</p>
            </Card>
          ) : (
            users.map((user) => {
              const config = roleConfig[user.role];
              return (
                <Card key={user.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name || "?"} src={user.avatar_url} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-stone-900">{user.full_name || "—"}</p>
                          <Badge variant={config?.variant ?? "stone"}>
                            {es ? config?.labelEs : config?.labelEn}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-400">
                      {user.city && <span>{user.city}</span>}
                      <span>{user.locale.toUpperCase()}</span>
                      <span>
                        {new Date(user.created_at).toLocaleDateString(
                          es ? "es-ES" : "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                      <AdminUserActions
                        userId={user.id}
                        userName={user.full_name || "?"}
                        currentRole={user.role}
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
