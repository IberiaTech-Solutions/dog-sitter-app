"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Dog, Cat, Bird, Rabbit, PawPrint, Upload } from "lucide-react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  weight_kg: number | null;
  microchip_id: string | null;
  medical_notes: string | null;
  special_instructions: string | null;
  photo_url: string | null;
} | null;

const speciesOptions = [
  { value: "dog", icon: Dog },
  { value: "cat", icon: Cat },
  { value: "bird", icon: Bird },
  { value: "rabbit", icon: Rabbit },
  { value: "other", icon: PawPrint },
];

const speciesLabels: Record<string, Record<string, string>> = {
  es: { dog: "Perro", cat: "Gato", bird: "Pájaro", rabbit: "Conejo", other: "Otro" },
  en: { dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit", other: "Other" },
};

export function PetForm({ existing }: { existing?: Pet }) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";

  const [name, setName] = useState(existing?.name ?? "");
  const [species, setSpecies] = useState(
    existing?.species && !["dog", "cat", "bird", "rabbit"].includes(existing.species) ? "other" : (existing?.species ?? "dog")
  );
  const [customSpecies, setCustomSpecies] = useState(
    existing?.species && !["dog", "cat", "bird", "rabbit"].includes(existing.species) ? existing.species : ""
  );
  const [breed, setBreed] = useState(existing?.breed ?? "");
  const [age, setAge] = useState(existing?.age_years?.toString() ?? "");
  const [weight, setWeight] = useState(existing?.weight_kg?.toString() ?? "");
  const [microchip, setMicrochip] = useState(existing?.microchip_id ?? "");
  const [medical, setMedical] = useState(existing?.medical_notes ?? "");
  const [instructions, setInstructions] = useState(existing?.special_instructions ?? "");
  const [photoUrl, setPhotoUrl] = useState(existing?.photo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(es ? "La foto es demasiado grande (máx 5MB)" : "Photo too large (max 5MB)");
      e.target.value = "";
      return;
    }
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `pets/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { data } = await supabase.storage.from("visit-photos").upload(fileName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage.from("visit-photos").getPublicUrl(data.path);
      setPhotoUrl(publicUrl);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    if (age && (parseInt(age) < 0 || parseInt(age) > 30)) {
      toast.error(es ? "Edad no válida (0-30)" : "Invalid age (0-30)");
      setLoading(false);
      return;
    }
    if (weight && (parseFloat(weight) < 0 || parseFloat(weight) > 200)) {
      toast.error(es ? "Peso no válido (0-200 kg)" : "Invalid weight (0-200 kg)");
      setLoading(false);
      return;
    }

    const finalSpecies = species === "other" && customSpecies.trim() ? customSpecies.trim().toLowerCase() : species;

    const petData = {
      owner_id: user.id,
      name,
      species: finalSpecies,
      breed: breed || null,
      age_years: age ? parseInt(age) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      microchip_id: microchip || null,
      medical_notes: medical || null,
      special_instructions: instructions || null,
      photo_url: photoUrl || null,
    };

    const { error: dbError } = existing
      ? await supabase.from("pets").update(petData).eq("id", existing.id)
      : await supabase.from("pets").insert(petData);

    if (dbError) {
      toast.error(es ? "No se pudo guardar la mascota" : "Could not save pet");
      setLoading(false);
      return;
    }

    toast.success(
      existing
        ? es ? `${name} actualizado` : `${name} updated`
        : es ? `${name} añadido` : `${name} added`,
      { description: es ? "Perfil de mascota guardado" : "Pet profile saved" }
    );
    router.push("/dashboard/pets");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo upload */}
      <Card padding="lg">
        <label className="block text-sm font-medium text-ink mb-3">
          {es ? "Foto" : "Photo"}
        </label>
        <div className="flex items-center gap-5">
          {photoUrl ? (
            <Image src={photoUrl} alt="" width={80} height={80} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-line/50 flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-ink-soft" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-canvas transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? (es ? "Subiendo..." : "Uploading...") : es ? "Subir foto" : "Upload photo"}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="text-xs text-danger hover:text-danger transition-colors"
              >
                {es ? "Quitar foto" : "Remove photo"}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Species */}
      <Card padding="lg">
        <label className="block text-sm font-medium text-ink mb-3">
          {es ? "Tipo de mascota" : "Pet type"}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {speciesOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSpecies(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-all ${
                species === opt.value
                  ? "border-brand bg-brand-soft"
                  : "border-line hover:border-ink-soft/40"
              }`}
            >
              <opt.icon className={`w-6 h-6 ${species === opt.value ? "text-brand" : "text-ink-soft"}`} />
              <span className={`text-xs font-medium ${species === opt.value ? "text-brand-ink" : "text-ink-muted"}`}>
                {speciesLabels[locale]?.[opt.value]}
              </span>
            </button>
          ))}
        </div>
        {species === "other" && (
          <input
            type="text"
            value={customSpecies}
            onChange={(e) => setCustomSpecies(e.target.value)}
            className="mt-3 w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm placeholder:text-ink-soft focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            placeholder={es ? "Ej: hámster, tortuga, pez..." : "E.g. hamster, turtle, fish..."}
            maxLength={30}
          />
        )}
      </Card>

      {/* Basic info */}
      <Card padding="lg">
        <div className="space-y-4">
          <Input
            id="name"
            type="text"
            label={`${es ? "Nombre" : "Name"} *`}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={es ? "Nombre de tu mascota" : "Your pet's name"}
            maxLength={50}
          />

          <Input
            id="breed"
            type="text"
            label={es ? "Raza" : "Breed"}
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder={es ? "Ej: Golden Retriever" : "E.g. Golden Retriever"}
            maxLength={50}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="age"
              type="number"
              label={es ? "Edad (años)" : "Age (years)"}
              min="0"
              max="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <Input
              id="weight"
              type="number"
              label={es ? "Peso (kg)" : "Weight (kg)"}
              min="0"
              max="200"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Health & ID */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-ink mb-4">
          {es ? "Salud e identificación" : "Health & identification"}
        </h3>

        <div className="space-y-4">
          <Input
            id="microchip"
            type="text"
            label={es ? "Número de microchip" : "Microchip number"}
            value={microchip}
            onChange={(e) => setMicrochip(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
            placeholder="941000XXXXXXXXX"
            maxLength={20}
          />

          <Textarea
            id="medical"
            label={es ? "Notas médicas" : "Medical notes"}
            rows={3}
            value={medical}
            onChange={(e) => setMedical(e.target.value)}
            maxLength={1000}
            placeholder={es
              ? "Alergias, medicación, condiciones especiales..."
              : "Allergies, medication, special conditions..."}
          />

          <Textarea
            id="instructions"
            label={es ? "Instrucciones para el cuidador" : "Instructions for the sitter"}
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            maxLength={1000}
            placeholder={es
              ? "Horarios de comida, rutinas, cosas que le gustan..."
              : "Feeding times, routines, things they like..."}
          />
        </div>
      </Card>

      {error && (
        <div className="rounded-xl bg-danger-soft border border-danger/30 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading || !name}
        className="w-full"
      >
        {loading
          ? es ? "Guardando..." : "Saving..."
          : existing
            ? es ? "Actualizar mascota" : "Update pet"
            : es ? "Añadir mascota" : "Add pet"}
      </Button>
    </form>
  );
}
