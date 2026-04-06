"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";

type Sitter = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  hourly_rate: number;
  services: string[];
  pet_types: string[];
  is_verified: boolean;
  distance_meters: number;
};

const serviceLabels: Record<string, Record<string, string>> = {
  es: {
    dog_walking: "Paseo",
    pet_sitting: "Cuidado",
    drop_in: "Visita",
    overnight: "Noche",
  },
  en: {
    dog_walking: "Walking",
    pet_sitting: "Sitting",
    drop_in: "Drop-in",
    overnight: "Overnight",
  },
};

const petEmojis: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  rabbit: "🐇",
  other: "🐾",
};

export function SitterSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(
        locale === "es"
          ? "Tu navegador no soporta geolocalizacion"
          : "Your browser doesn't support geolocation"
      );
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const supabase = createClient();
        const { data, error } = await supabase.rpc("find_nearby_sitters", {
          lat: latitude,
          lng: longitude,
          radius_meters: 15000,
        });

        if (error) {
          setLocationError(error.message);
        } else {
          setSitters(data ?? []);
        }
        setLoading(false);
      },
      () => {
        setLocationError(
          locale === "es"
            ? "No se pudo obtener tu ubicacion. Permite el acceso a la ubicacion."
            : "Could not get your location. Please allow location access."
        );
        setLoading(false);
      }
    );
  }, [locale]);

  if (loading) {
    return (
      <div className="mt-12 flex flex-col items-center gap-4 text-stone-400">
        <div className="w-10 h-10 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
        <span className="text-3xl block mb-3">📍</span>
        <p className="text-sm text-amber-800">{locationError}</p>
      </div>
    );
  }

  if (sitters.length === 0) {
    return (
      <div className="mt-12 text-center">
        <span className="text-5xl block mb-4">🐾</span>
        <p className="text-stone-500">
          {locale === "es"
            ? "No hay cuidadores disponibles cerca de ti todavia."
            : "No sitters available near you yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sitters.map((sitter) => (
        <Link
          key={sitter.id}
          href={`/sitter/${sitter.id}`}
          className="group rounded-2xl bg-white p-5 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all"
        >
          <div className="flex items-start gap-3.5">
            <div className="h-13 w-13 shrink-0 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-lg font-bold shadow-sm shadow-green-200">
              {sitter.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 truncate group-hover:text-green-700 transition-colors">
                  {sitter.full_name}
                </h3>
                {sitter.is_verified && (
                  <span className="shrink-0 text-green-500 text-sm" title={t("sitter.verified")}>
                    🛡️
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {Math.round(sitter.distance_meters / 1000)} km {locale === "es" ? "de ti" : "away"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-stone-900">
                {sitter.hourly_rate.toFixed(0)}€
              </span>
              <span className="block text-xs text-stone-400">
                {t("sitter.perVisit")}
              </span>
            </div>
          </div>

          {/* Pet types */}
          <div className="mt-3 flex gap-1.5">
            {sitter.pet_types.map((pet) => (
              <span key={pet} className="text-lg" title={pet}>
                {petEmojis[pet] ?? "🐾"}
              </span>
            ))}
          </div>

          {/* Services */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sitter.services.map((service) => (
              <span
                key={service}
                className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
              >
                {serviceLabels[locale]?.[service] ?? service}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
