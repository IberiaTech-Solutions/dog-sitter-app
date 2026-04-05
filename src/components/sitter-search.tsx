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
          ? "Tu navegador no soporta geolocalización"
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
            ? "No se pudo obtener tu ubicación. Permite el acceso a la ubicación."
            : "Could not get your location. Please allow location access."
        );
        setLoading(false);
      }
    );
  }, [locale]);

  if (loading) {
    return (
      <div className="mt-8 text-center text-zinc-500">
        {t("common.loading")}
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="mt-8 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        {locationError}
      </div>
    );
  }

  if (sitters.length === 0) {
    return (
      <div className="mt-8 text-center text-zinc-500">
        {locale === "es"
          ? "No hay cuidadores disponibles cerca de ti todavía."
          : "No sitters available near you yet."}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sitters.map((sitter) => (
        <div
          key={sitter.id}
          className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
              {sitter.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 truncate">
                  {sitter.full_name}
                </h3>
                {sitter.is_verified && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {t("sitter.verified")}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">
                {Math.round(sitter.distance_meters / 1000)} km
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {sitter.services.map((service) => (
              <span
                key={service}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
              >
                {serviceLabels[locale]?.[service] ?? service}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-zinc-900">
              {sitter.hourly_rate.toFixed(2).replace(".", ",")} €{" "}
              <span className="text-sm font-normal text-zinc-500">
                {t("sitter.perVisit")}
              </span>
            </span>
            <Link
              href={`/sitter/${sitter.id}`}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t("sitter.viewProfile")}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
