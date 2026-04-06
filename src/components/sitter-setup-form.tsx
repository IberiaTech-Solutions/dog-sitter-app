"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Card, Input, Button } from "@/components/ui";

// Spanish city coordinates for auto-geocoding
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "gijón": { lat: 43.5322, lng: -5.6611 },
  "gijon": { lat: 43.5322, lng: -5.6611 },
  "oviedo": { lat: 43.3614, lng: -5.8493 },
  "madrid": { lat: 40.4168, lng: -3.7038 },
  "barcelona": { lat: 41.3874, lng: 2.1686 },
  "valencia": { lat: 39.4699, lng: -0.3763 },
  "sevilla": { lat: 37.3891, lng: -5.9845 },
  "bilbao": { lat: 43.2630, lng: -2.9350 },
  "málaga": { lat: 36.7213, lng: -4.4214 },
  "malaga": { lat: 36.7213, lng: -4.4214 },
  "zaragoza": { lat: 41.6488, lng: -0.8891 },
  "santander": { lat: 43.4623, lng: -3.8100 },
  "a coruña": { lat: 43.3623, lng: -8.4115 },
  "vigo": { lat: 42.2406, lng: -8.7207 },
  "granada": { lat: 37.1773, lng: -3.5986 },
  "murcia": { lat: 37.9922, lng: -1.1307 },
  "alicante": { lat: 38.3452, lng: -0.4810 },
};

type SitterProfile = {
  hourly_rate: number;
  services: string[];
  pet_types: string[];
  experience_years: number | null;
  address: string | null;
  radius_km: number;
  is_available: boolean;
  cancellation_policy: string;
} | null;

const ALL_SERVICES = ["dog_walking", "pet_sitting", "drop_in", "overnight"];
const ALL_PET_TYPES = ["dog", "cat", "bird", "rabbit", "other"];

const serviceLabels: Record<string, Record<string, string>> = {
  es: {
    dog_walking: "Paseo de perros",
    pet_sitting: "Cuidado de mascotas",
    drop_in: "Visita a domicilio",
    overnight: "Estancia nocturna",
  },
  en: {
    dog_walking: "Dog walking",
    pet_sitting: "Pet sitting",
    drop_in: "Drop-in visit",
    overnight: "Overnight stay",
  },
};

const petTypeLabels: Record<string, Record<string, string>> = {
  es: { dog: "Perro", cat: "Gato", bird: "Pájaro", rabbit: "Conejo", other: "Otro" },
  en: { dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit", other: "Other" },
};

export function SitterSetupForm({ existing }: { existing: SitterProfile }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [rate, setRate] = useState(existing?.hourly_rate?.toString() ?? "15");
  const [services, setServices] = useState<string[]>(
    existing?.services ?? ["pet_sitting"]
  );
  const [petTypes, setPetTypes] = useState<string[]>(
    existing?.pet_types ?? ["dog"]
  );
  const [experience, setExperience] = useState(
    existing?.experience_years?.toString() ?? ""
  );
  const [address, setAddress] = useState(existing?.address ?? "");
  const [radius, setRadius] = useState(existing?.radius_km?.toString() ?? "10");
  const [cancellationPolicy, setCancellationPolicy] = useState(existing?.cancellation_policy ?? "flexible");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  function toggleItem(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(
      arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
    );
  }

  function handleGetLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    // Auto-geocode from address if no GPS location
    let finalLocation = location;
    if (!finalLocation && address) {
      const lower = address.toLowerCase().trim();
      for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (lower.includes(city) || city.includes(lower.split(",")[0].trim())) {
          finalLocation = coords;
          break;
        }
      }
    }

    if (!finalLocation) {
      toast.error(
        locale === "es"
          ? "Necesitamos tu ubicación para que los dueños te encuentren. Usa el GPS o escribe una ciudad conocida."
          : "We need your location so owners can find you. Use GPS or type a known city."
      );
      setLoading(false);
      return;
    }

    const sitterData = {
      id: user.id,
      hourly_rate: parseFloat(rate),
      services,
      pet_types: petTypes,
      experience_years: experience ? parseInt(experience) : null,
      address: address || null,
      radius_km: parseInt(radius),
      is_available: true,
      cancellation_policy: cancellationPolicy,
      location: `SRID=4326;POINT(${finalLocation.lng} ${finalLocation.lat})`,
    };

    const { error: dbError } = existing
      ? await supabase
          .from("sitter_profiles")
          .update(sitterData)
          .eq("id", user.id)
      : await supabase.from("sitter_profiles").insert(sitterData);

    if (dbError) {
      toast.error(locale === "es" ? "No se pudo guardar el perfil" : "Could not save profile");
      setLoading(false);
      return;
    }

    toast.success(
      locale === "es" ? "Perfil de cuidador guardado" : "Sitter profile saved"
    );
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Services */}
      <Card>
        <label className="block text-sm font-medium text-stone-700">
          {locale === "es" ? "Servicios que ofreces" : "Services you offer"}
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {ALL_SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleItem(services, s, setServices)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                services.includes(s)
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {serviceLabels[locale]?.[s] ?? s}
            </button>
          ))}
        </div>
      </Card>

      {/* Pet types */}
      <Card>
        <label className="block text-sm font-medium text-stone-700">
          {locale === "es" ? "Tipos de mascotas" : "Pet types"}
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_PET_TYPES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleItem(petTypes, p, setPetTypes)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                petTypes.includes(p)
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {petTypeLabels[locale]?.[p] ?? p}
            </button>
          ))}
        </div>
      </Card>

      {/* Rate & experience */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label={locale === "es" ? "Tarifa por visita (€)" : "Rate per visit (€)"}
            required
            min={5}
            max={200}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <Input
            type="number"
            label={locale === "es" ? "Años de experiencia" : "Years of experience"}
            min={0}
            max={50}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
      </Card>

      {/* Location */}
      <Card>
        <Input
          type="text"
          label={locale === "es" ? "Ubicación" : "Location"}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={locale === "es" ? "Tu dirección o zona" : "Your address or area"}
        />
        <div className="mt-3 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={geoLoading}
            onClick={handleGetLocation}
          >
            {geoLoading
              ? t("common.loading")
              : locale === "es"
                ? "Usar mi ubicación actual"
                : "Use my current location"}
          </Button>
          {location && (
            <span className="text-sm text-green-600">
              {locale === "es" ? "Ubicación guardada" : "Location saved"}
            </span>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700">
            {locale === "es" ? "Radio de servicio (km)" : "Service radius (km)"}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="mt-2 w-full accent-green-600"
          />
          <p className="mt-1 text-sm text-stone-500">{radius} km</p>
        </div>
      </Card>

      {/* Cancellation policy */}
      <Card>
        <label className="block text-sm font-medium text-stone-700">
          {locale === "es" ? "Política de cancelación" : "Cancellation policy"}
        </label>
        <div className="mt-3 space-y-2">
          {([
            {
              value: "flexible",
              titleEs: "Flexible",
              titleEn: "Flexible",
              descEs: "Reembolso completo hasta 24h antes del inicio",
              descEn: "Full refund up to 24h before start",
            },
            {
              value: "moderate",
              titleEs: "Moderada",
              titleEn: "Moderate",
              descEs: "Reembolso completo hasta 5 días antes, 50% después",
              descEn: "Full refund up to 5 days before, 50% after",
            },
            {
              value: "strict",
              titleEs: "Estricta",
              titleEn: "Strict",
              descEs: "50% reembolso hasta 7 días antes, sin reembolso después",
              descEn: "50% refund up to 7 days before, no refund after",
            },
          ] as const).map((policy) => (
            <button
              key={policy.value}
              type="button"
              onClick={() => setCancellationPolicy(policy.value)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                cancellationPolicy === policy.value
                  ? "border-green-600 bg-green-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className={`text-sm font-medium ${cancellationPolicy === policy.value ? "text-green-700" : "text-stone-900"}`}>
                {locale === "es" ? policy.titleEs : policy.titleEn}
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                {locale === "es" ? policy.descEs : policy.descEn}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Button
        type="submit"
        disabled={loading || services.length === 0 || petTypes.length === 0}
        size="lg"
        className="w-full rounded-full"
      >
        {loading
          ? t("common.loading")
          : existing
            ? locale === "es"
              ? "Actualizar perfil"
              : "Update profile"
            : locale === "es"
              ? "Crear perfil de cuidador"
              : "Create sitter profile"}
      </Button>
    </form>
  );
}
