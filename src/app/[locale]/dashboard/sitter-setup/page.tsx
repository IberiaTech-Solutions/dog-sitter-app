import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/ui";
import { SitterSetupForm } from "@/components/sitter-setup-form";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { VerificationForm } from "@/components/verification-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SitterSetupPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const es = locale === "es";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "sitter" && profile?.role !== "both") redirect(`/${locale}/dashboard`);

  const { data: existing } = await supabase
    .from("sitter_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const hasProfile = !!existing;

  const { data: verification } = hasProfile
    ? await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "dni_nie")
        .single()
    : { data: null };

  const { data: insuranceVerification } = hasProfile
    ? await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "sitter_insurance")
        .single()
    : { data: null };

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name}
      userRole={profile.role}
      avatarUrl={profile.avatar_url}
    >
      <div>
        {!hasProfile ? (
          <>
            <h1 className="text-2xl font-bold text-stone-900">
              {es ? "Configurar perfil de cuidador" : "Set up sitter profile"}
            </h1>
            <p className="mt-1 text-stone-500">
              {es
                ? "Completa tu perfil para empezar a recibir reservas."
                : "Complete your profile to start receiving bookings."}
            </p>
            <SitterSetupForm existing={existing} />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-stone-900">
              {es ? "Mi servicio" : "My service"}
            </h1>
            <p className="mt-1 text-stone-500">
              {es
                ? "Gestiona tu perfil, verificación y disponibilidad."
                : "Manage your profile, verification, and availability."}
            </p>

            {/* Profile form — collapsible since it's already set up */}
            <details className="mt-6 group">
              <summary className="cursor-pointer flex items-center justify-between rounded-2xl bg-white border border-stone-100 px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-stone-900">
                    {es ? "Perfil de cuidador" : "Sitter profile"}
                  </p>
                  <p className="text-sm text-stone-400 mt-0.5">
                    {existing.services?.length ?? 0} {es ? "servicios" : "services"} · {Number(existing.hourly_rate).toFixed(0)}€/{es ? "visita" : "visit"}
                  </p>
                </div>
                <span className="text-sm text-green-600 font-medium group-open:hidden">
                  {es ? "Editar" : "Edit"}
                </span>
              </summary>
              <div className="mt-4">
                <SitterSetupForm existing={existing} />
              </div>
            </details>

            {/* Verification */}
            <div className="mt-6">
              <VerificationForm userId={user.id} existing={verification} />
            </div>

            <div className="mt-4">
              <VerificationForm userId={user.id} existing={insuranceVerification} type="sitter_insurance" />
            </div>

            {/* Availability */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">
                {es ? "Tu disponibilidad" : "Your availability"}
              </h2>
              <AvailabilityCalendar sitterId={user.id} isEditable />
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
