import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Dog, Cat, Bird, Rabbit, PawPrint, Plus, Pencil } from "lucide-react";
import { DashboardShell, Card, Badge, LinkButton } from "@/components/ui";

type Props = {
  params: Promise<{ locale: string }>;
};

const speciesIcons: Record<string, typeof Dog> = {
  dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit,
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      appName={t("common.appName")}
      locale={locale}
      userName={profile?.full_name ?? ""}
      userRole={profile?.role ?? "owner"}
      avatarUrl={profile?.avatar_url}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">
          {es ? "Mis mascotas" : "My pets"}
        </h1>
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
        <div className="mt-6 space-y-4">
          {pets.map((pet) => {
            const Icon = speciesIcons[pet.species] ?? PawPrint;
            return (
              <Card key={pet.id} padding="lg">
                <div className="flex items-start gap-5">
                  {pet.photo_url ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <Image src={pet.photo_url} alt={pet.name} width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Icon className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-stone-900 truncate">{pet.name}</h3>
                        <Badge variant="amber">
                          {speciesLabels[locale]?.[pet.species] ?? pet.species}
                        </Badge>
                      </div>
                      <Link
                        href={`/dashboard/pets/${pet.id}`}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {es ? "Editar" : "Edit"}
                      </Link>
                    </div>
                    {pet.breed && (
                      <p className="text-sm text-stone-500 mt-0.5">{pet.breed}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-400">
                      {pet.age_years != null && (
                        <span>{pet.age_years} {es ? "años" : "yrs"}</span>
                      )}
                      {pet.weight_kg != null && (
                        <span>{Number(pet.weight_kg).toFixed(1)} kg</span>
                      )}
                      {pet.microchip_id && (
                        <span>Microchip: {pet.microchip_id}</span>
                      )}
                    </div>
                  </div>
                </div>
                {(pet.medical_notes || pet.special_instructions) && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                    {pet.medical_notes && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">
                          {es ? "Notas médicas" : "Medical notes"}
                        </p>
                        <p className="text-sm text-stone-600 bg-stone-50 rounded-xl px-4 py-2.5">
                          {pet.medical_notes}
                        </p>
                      </div>
                    )}
                    {pet.special_instructions && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">
                          {es ? "Instrucciones para el cuidador" : "Instructions for the sitter"}
                        </p>
                        <p className="text-sm text-stone-600 bg-stone-50 rounded-xl px-4 py-2.5">
                          {pet.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
