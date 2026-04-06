import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { DashboardShell } from "@/components/ui";
import { PetForm } from "@/components/pet-form";
import { DeletePetButton } from "@/components/delete-pet-button";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditPetPage({ params }: Props) {
  const { locale, id } = await params;
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

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!pet) notFound();

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-stone-900">
          {es ? `Editar ${pet.name}` : `Edit ${pet.name}`}
        </h1>
        <DeletePetButton petId={id} />
      </div>
      <PetForm existing={pet} />
    </DashboardShell>
  );
}
