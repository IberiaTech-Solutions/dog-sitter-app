"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

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

    // Update profile role to include sitter
    await supabase
      .from("profiles")
      .update({ role: "both" })
      .eq("id", user.id);

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
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
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
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {serviceLabels[locale]?.[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Pet types */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
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
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {petTypeLabels[locale]?.[p] ?? p}
            </button>
          ))}
        </div>
      </div>

      {/* Rate & experience */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              {locale === "es" ? "Tarifa por visita (€)" : "Rate per visit (€)"}
            </label>
            <input
              type="number"
              required
              min="5"
              max="200"
              step="0.50"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              {locale === "es" ? "Años de experiencia" : "Years of experience"}
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          {locale === "es" ? "Ubicación" : "Location"}
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={locale === "es" ? "Tu dirección o zona" : "Your address or area"}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={geoLoading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            {geoLoading
              ? t("common.loading")
              : locale === "es"
                ? "Usar mi ubicación actual"
                : "Use my current location"}
          </button>
          {location && (
            <span className="text-sm text-emerald-600">
              {locale === "es" ? "Ubicación guardada" : "Location saved"}
            </span>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-700">
            {locale === "es" ? "Radio de servicio (km)" : "Service radius (km)"}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="mt-2 w-full accent-emerald-600"
          />
          <p className="mt-1 text-sm text-zinc-500">{radius} km</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || services.length === 0 || petTypes.length === 0}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
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
      </button>
    </form>
  );
}
