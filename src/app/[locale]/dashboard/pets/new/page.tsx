import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PawPrint, ArrowLeft } from "lucide-react";
import { Header, PageShell } from "@/components/ui";
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

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn>
        <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          {es ? "Mi panel" : "Dashboard"}
        </Link>
      </Header>

      <PageShell maxWidth="md">
        <Link
          href="/dashboard/pets"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {es ? "Volver a mis mascotas" : "Back to my pets"}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {es ? "Añadir mascota" : "Add a pet"}
            </h1>
            <p className="text-sm text-stone-400">
              {es ? "Cuéntanos sobre tu compañero peludo" : "Tell us about your furry friend"}
            </p>
          </div>
        </div>

        <PetForm />
      </PageShell>
    </div>
  );
}
