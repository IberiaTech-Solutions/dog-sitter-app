import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PawPrint, ArrowLeft, Trash2 } from "lucide-react";
import { Header, PageShell } from "@/components/ui";
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

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!pet) notFound();

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn>
        <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          {es ? "Mi panel" : "Dashboard"}
        </Link>
      </Header>

      <PageShell maxWidth="md">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/pets"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {es ? "Volver a mis mascotas" : "Back to my pets"}
          </Link>
          <DeletePetButton petId={id} />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {es ? `Editar ${pet.name}` : `Edit ${pet.name}`}
            </h1>
          </div>
        </div>

        <PetForm existing={pet} />
      </PageShell>
    </div>
  );
}
