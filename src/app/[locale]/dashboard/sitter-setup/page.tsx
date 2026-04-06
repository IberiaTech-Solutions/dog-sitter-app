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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "sitter") redirect(`/${locale}/dashboard`);

  const { data: existing } = await supabase
    .from("sitter_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: verification } = await supabase
    .from("verifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "dni_nie")
    .single();

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile.full_name}
      userRole={profile.role}
      avatarUrl={profile.avatar_url}
      backHref="/dashboard"
      title={locale === "es" ? "Perfil cuidador" : "Sitter profile"}
    >
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-stone-900">
          {locale === "es"
            ? "Configurar perfil de cuidador"
            : "Set up sitter profile"}
        </h1>
        <p className="mt-1 text-stone-500">
          {locale === "es"
            ? "Completa tu perfil para empezar a recibir reservas."
            : "Complete your profile to start receiving bookings."}
        </p>
        <SitterSetupForm existing={existing} />

        <div className="mt-8">
          <VerificationForm userId={user.id} existing={verification} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            {locale === "es" ? "Tu disponibilidad" : "Your availability"}
          </h2>
          <AvailabilityCalendar sitterId={user.id} isEditable />
        </div>
      </div>
    </DashboardShell>
  );
}
