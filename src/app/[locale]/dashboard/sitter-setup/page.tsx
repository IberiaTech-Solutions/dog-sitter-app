import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SitterSetupForm } from "@/components/sitter-setup-form";

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

  // Check if sitter profile already exists
  const { data: existing } = await supabase
    .from("sitter_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {locale === "es"
            ? "Configurar perfil de cuidador"
            : "Set up sitter profile"}
        </h1>
        <p className="mt-2 text-zinc-500">
          {locale === "es"
            ? "Completa tu perfil para empezar a recibir reservas."
            : "Complete your profile to start receiving bookings."}
        </p>

        <SitterSetupForm existing={existing} />
      </main>
    </div>
  );
}
