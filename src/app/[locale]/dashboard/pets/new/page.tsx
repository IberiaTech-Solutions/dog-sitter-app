import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/ui";
import { PetForm } from "@/components/pet-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewPetPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const es = locale === "es";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <h1 className="text-2xl font-bold text-ink">
        {es ? "Añadir mascota" : "Add a pet"}
      </h1>
      <p className="mt-1 text-ink-muted">
        {es ? "Cuéntanos sobre tu compañero peludo" : "Tell us about your furry friend"}
      </p>
      <PetForm />
    </DashboardShell>
  );
}
