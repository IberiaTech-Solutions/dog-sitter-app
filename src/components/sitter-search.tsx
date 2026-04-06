"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { MapPin, Shield, Star, Dog, Cat, Bird, Rabbit, PawPrint, MapPinOff, Search } from "lucide-react";
import { Avatar, Badge, Card } from "@/components/ui";

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

const petIcons: Record<string, typeof Dog> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
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
            ? "No se pudo obtener tu ubicación. Permite el acceso a la ubicación en tu navegador."
            : "Could not get your location. Please allow location access in your browser."
        );
        setLoading(false);
      }
    );
  }, [locale]);

  if (loading) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm text-stone-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (locationError) {
    return (
      <Card className="mt-8 text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <MapPinOff className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="font-semibold text-stone-900">
          {locale === "es" ? "Ubicación no disponible" : "Location unavailable"}
        </h3>
        <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">{locationError}</p>
      </Card>
    );
  }

  if (sitters.length === 0) {
    return (
      <Card className="mt-8 text-center py-16">
        <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto mb-5">
          <Search className="w-9 h-9 text-stone-300" />
        </div>
        <h3 className="text-lg font-semibold text-stone-900">
          {locale === "es"
            ? "Aún no hay cuidadores en tu zona"
            : "No sitters in your area yet"}
        </h3>
        <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
          {locale === "es"
            ? "Estamos creciendo rápido. Vuelve pronto o regístrate como cuidador para ser el primero en tu zona."
            : "We're growing fast. Check back soon or sign up as a sitter to be the first in your area."}
        </p>
        <div className="mt-6 flex justify-center">
          <Image
            src="/images/happy-dog.jpg"
            alt=""
            width={280}
            height={180}
            className="rounded-2xl object-cover"
          />
        </div>
      </Card>
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
            <Avatar name={sitter.full_name} src={sitter.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 truncate group-hover:text-green-700 transition-colors">
                  {sitter.full_name}
                </h3>
                {sitter.is_verified && (
                  <Shield className="w-4 h-4 text-green-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                {Math.round(sitter.distance_meters / 1000)} km
              </div>
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
          <div className="mt-3 flex gap-2">
            {sitter.pet_types.map((pet) => {
              const Icon = petIcons[pet] ?? PawPrint;
              return (
                <div key={pet} className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center" title={pet}>
                  <Icon className="w-3.5 h-3.5 text-stone-500" />
                </div>
              );
            })}
          </div>

          {/* Services */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sitter.services.map((service) => (
              <Badge key={service} variant="stone">
                {serviceLabels[locale]?.[service] ?? service}
              </Badge>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
