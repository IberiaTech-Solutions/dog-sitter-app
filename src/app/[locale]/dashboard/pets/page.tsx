import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Dog, Cat, Bird, Rabbit, PawPrint, Plus, Pencil } from "lucide-react";
import { Header, PageShell, Card, Badge, LinkButton } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
};

const speciesIcons: Record<string, typeof Dog> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
};

const speciesLabels: Record<string, Record<string, string>> = {
  es: { dog: "Perro", cat: "Gato", bird: "Pájaro", rabbit: "Conejo", other: "Otro" },
  en: { dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit", other: "Other" },
};

export default async function PetsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const es = locale === "es";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn>
        <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          {es ? "Mi panel" : "Dashboard"}
        </Link>
      </Header>

      <PageShell maxWidth="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                {es ? "Mis mascotas" : "My pets"}
              </h1>
              <p className="text-sm text-stone-400">
                {es ? "Gestiona los perfiles de tus mascotas" : "Manage your pet profiles"}
              </p>
            </div>
          </div>
          <LinkButton href="/dashboard/pets/new" variant="primary" size="md">
            <Plus className="w-4 h-4" />
            {es ? "Añadir mascota" : "Add pet"}
          </LinkButton>
        </div>

        {!pets || pets.length === 0 ? (
          <Card className="mt-8 text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <PawPrint className="w-9 h-9 text-amber-300" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">
              {es ? "Aún no has añadido mascotas" : "No pets added yet"}
            </h3>
            <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
              {es
                ? "Añade tu primera mascota para poder buscar cuidadores y hacer reservas."
                : "Add your first pet to start searching for sitters and making bookings."}
            </p>
            <LinkButton href="/dashboard/pets/new" variant="primary" size="lg" className="mt-6">
              <Plus className="w-4 h-4" />
              {es ? "Añadir mi primera mascota" : "Add my first pet"}
            </LinkButton>
          </Card>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pets.map((pet) => {
              const Icon = speciesIcons[pet.species] ?? PawPrint;
              return (
                <Card key={pet.id} padding="lg" hover>
                  <div className="flex items-start gap-4">
                    {pet.photo_url ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                        <Image src={pet.photo_url} alt={pet.name} width={64} height={64} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-amber-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-stone-900 truncate">{pet.name}</h3>
                        <Badge variant="amber">
                          {speciesLabels[locale]?.[pet.species] ?? pet.species}
                        </Badge>
                      </div>
                      {pet.breed && (
                        <p className="text-sm text-stone-500 mt-0.5">{pet.breed}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-stone-400">
                        {pet.age_years != null && (
                          <span>{pet.age_years} {es ? "años" : "years"}</span>
                        )}
                        {pet.weight_kg != null && (
                          <span>{Number(pet.weight_kg).toFixed(1)} kg</span>
                        )}
                        {pet.microchip_id && (
                          <span>Microchip: {pet.microchip_id}</span>
                        )}
                      </div>
                      {pet.medical_notes && (
                        <p className="mt-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                          {pet.medical_notes}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/pets/${pet.id}`}
                      className="shrink-0 w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageShell>
    </div>
  );
}
