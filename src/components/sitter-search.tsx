"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { MapPin, Shield, Star, Dog, Cat, Bird, Rabbit, PawPrint, Search, Navigation, Map, List, ChevronDown, ChevronUp, X } from "lucide-react";
import { Avatar, Badge, Card, Button, Input } from "@/components/ui";
import { toast } from "sonner";

const SitterMap = lazy(() =>
  import("@/components/sitter-map").then((m) => ({ default: m.SitterMap }))
);

type Sitter = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  hourly_rate: number;
  services: string[];
  pet_types: string[];
  is_verified: boolean;
  distance_meters: number;
  sitter_lat: number;
  sitter_lng: number;
};

const serviceLabels: Record<string, Record<string, string>> = {
  es: { dog_walking: "Paseo", pet_sitting: "Cuidado", drop_in: "Visita", overnight: "Noche" },
  en: { dog_walking: "Walking", pet_sitting: "Sitting", drop_in: "Drop-in", overnight: "Overnight" },
};

const petIcons: Record<string, typeof Dog> = {
  dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit,
};

const petLabels: Record<string, Record<string, string>> = {
  es: { dog: "Perro", cat: "Gato", bird: "Pájaro", rabbit: "Conejo", other: "Otro" },
  en: { dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit", other: "Other" },
};

const SERVICE_KEYS = ["dog_walking", "pet_sitting", "drop_in", "overnight"] as const;
const PET_KEYS = ["dog", "cat", "bird", "rabbit", "other"] as const;

// Spanish city coordinates for manual search
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
  "alicante": { lat: 38.3452, lng: -0.4810 },
  "san sebastián": { lat: 43.3183, lng: -1.9812 },
  "san sebastian": { lat: 43.3183, lng: -1.9812 },
  "santander": { lat: 43.4623, lng: -3.8100 },
  "a coruña": { lat: 43.3623, lng: -8.4115 },
  "vigo": { lat: 42.2406, lng: -8.7207 },
  "palma": { lat: 39.5696, lng: 2.6502 },
  "las palmas": { lat: 28.1235, lng: -15.4363 },
  "granada": { lat: 37.1773, lng: -3.5986 },
  "murcia": { lat: 37.9922, lng: -1.1307 },
};

export function SitterSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const es = locale === "es";
  const initialCity = searchParams.get("city") ?? "";
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cityQuery, setCityQuery] = useState(initialCity);
  const [gpsLoading, setGpsLoading] = useState(false);
  const autoSearched = useRef(false);
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedServices.size > 0) count++;
    if (selectedPets.size > 0) count++;
    if (priceMin || priceMax) count++;
    if (verifiedOnly) count++;
    return count;
  }, [selectedServices.size, selectedPets.size, priceMin, priceMax, verifiedOnly]);

  function clearFilters() {
    setSelectedServices(new Set());
    setSelectedPets(new Set());
    setPriceMin("");
    setPriceMax("");
    setVerifiedOnly(false);
  }

  function toggleInSet(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return next;
  }

  const filteredSitters = useMemo(() => {
    return sitters.filter((s) => {
      if (selectedServices.size > 0) {
        const hasMatch = s.services.some((svc) => selectedServices.has(svc));
        if (!hasMatch) return false;
      }
      if (selectedPets.size > 0) {
        const hasMatch = s.pet_types.some((pt) => selectedPets.has(pt));
        if (!hasMatch) return false;
      }
      if (priceMin && s.hourly_rate < Number(priceMin)) return false;
      if (priceMax && s.hourly_rate > Number(priceMax)) return false;
      if (verifiedOnly && !s.is_verified) return false;
      return true;
    });
  }, [sitters, selectedServices, selectedPets, priceMin, priceMax, verifiedOnly]);

  async function searchByCoords(lat: number, lng: number) {
    setLoading(true);
    setSearchCenter({ lat, lng });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("find_nearby_sitters", {
      lat, lng, radius_meters: 25000,
    });

    if (error) {
      toast.error(es ? "Error al buscar cuidadores" : "Error searching for sitters");
    } else {
      setSitters(data ?? []);
    }
    setSearched(true);
    setLoading(false);
  }

  // Auto-search if city was passed from landing page
  useEffect(() => {
    if (initialCity && !autoSearched.current) {
      autoSearched.current = true;
      const query = initialCity.trim().toLowerCase();
      const coords = CITY_COORDS[query];
      if (coords) {
        searchByCoords(coords.lat, coords.lng);
      } else {
        const match = Object.keys(CITY_COORDS).find((c) => c.includes(query) || query.includes(c));
        if (match) searchByCoords(CITY_COORDS[match].lat, CITY_COORDS[match].lng);
      }
    }
  }, [initialCity]);

  function handleCitySearch(e: React.FormEvent) {
    e.preventDefault();
    const query = cityQuery.trim().toLowerCase();
    if (!query) return;

    const coords = CITY_COORDS[query];
    if (coords) {
      searchByCoords(coords.lat, coords.lng);
    } else {
      // Try partial match
      const match = Object.keys(CITY_COORDS).find((c) => c.includes(query) || query.includes(c));
      if (match) {
        searchByCoords(CITY_COORDS[match].lat, CITY_COORDS[match].lng);
      } else {
        toast.error(
          es ? `No encontramos "${cityQuery}". Prueba con otra ciudad.`
            : `We couldn't find "${cityQuery}". Try another city.`
        );
      }
    }
  }

  function handleGpsSearch() {
    if (!navigator.geolocation) {
      toast.error(es ? "Tu navegador no soporta geolocalización" : "Your browser doesn't support geolocation");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        searchByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setGpsLoading(false);
        toast.error(
          es ? "No se pudo obtener tu ubicación. Escribe tu ciudad."
            : "Could not get your location. Type your city instead."
        );
      }
    );
  }

  const mapSitters = sitters
    .filter((s) => s.sitter_lat && s.sitter_lng)
    .map((s) => ({
      id: s.id,
      full_name: s.full_name,
      hourly_rate: s.hourly_rate,
      is_verified: s.is_verified,
      distance_meters: s.distance_meters,
      lat: s.sitter_lat,
      lng: s.sitter_lng,
    }));

  const showMap = viewMode === "split" || viewMode === "map";
  const showList = viewMode === "split" || viewMode === "list";

  return (
    <div>
      {/* Search controls */}
      <div className="mt-6 rounded-2xl bg-white border border-stone-100 p-5 shadow-sm">
        <form onSubmit={handleCitySearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder={es ? "Escribe tu ciudad (ej: Gijón, Madrid...)" : "Type your city (e.g. Gijón, Madrid...)"}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="md" disabled={loading || !cityQuery.trim()}>
              <Search className="w-4 h-4" />
              {es ? "Buscar" : "Search"}
            </Button>
            <Button type="button" variant="outline" size="md" disabled={gpsLoading} onClick={handleGpsSearch}>
              <Navigation className="w-4 h-4" />
              {gpsLoading ? "..." : "GPS"}
            </Button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-stone-400">{t("common.loading")}</p>
        </div>
      )}

      {/* No search yet */}
      {!loading && !searched && (
        <Card className="mt-8 text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-green-400" />
          </div>
          <h3 className="font-semibold text-stone-900">
            {es ? "Busca cuidadores en tu zona" : "Search for sitters in your area"}
          </h3>
          <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
            {es
              ? "Escribe tu ciudad o usa el GPS para encontrar cuidadores cerca de ti."
              : "Type your city or use GPS to find sitters near you."}
          </p>
        </Card>
      )}

      {/* Empty results */}
      {!loading && searched && sitters.length === 0 && (
        <Card className="mt-8 text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto mb-5">
            <PawPrint className="w-9 h-9 text-stone-300" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900">
            {es ? "Aún no hay cuidadores en esta zona" : "No sitters in this area yet"}
          </h3>
          <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
            {es
              ? "Estamos creciendo rápido. Vuelve pronto o regístrate como cuidador para ser el primero en tu zona."
              : "We're growing fast. Check back soon or sign up as a sitter to be the first in your area."}
          </p>
          <div className="mt-6 flex justify-center">
            <Image src="/images/happy-dog.jpg" alt="" width={280} height={180} className="rounded-2xl object-cover" />
          </div>
        </Card>
      )}

      {/* Results with map */}
      {!loading && searched && sitters.length > 0 && (
        <>
          {/* Filter bar */}
          <Card className="mt-6">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-900">
                  {es ? "Filtros" : "Filters"}
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="green">{activeFilterCount}</Badge>
                )}
              </div>
              {filtersOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </button>

            {filtersOpen && (
              <div className="px-5 pb-5 space-y-5 border-t border-stone-100 pt-4">
                {/* Service type */}
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2">
                    {es ? "Tipo de servicio" : "Service type"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_KEYS.map((key) => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={
                          selectedServices.has(key)
                            ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                            : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                        }
                        onClick={() => setSelectedServices((s) => toggleInSet(s, key))}
                      >
                        {serviceLabels[locale]?.[key] ?? key}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pet type */}
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2">
                    {es ? "Tipo de mascota" : "Pet type"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PET_KEYS.map((key) => {
                      const Icon = petIcons[key] ?? PawPrint;
                      return (
                        <Button
                          key={key}
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={
                            selectedPets.has(key)
                              ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                              : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                          }
                          onClick={() => setSelectedPets((s) => toggleInSet(s, key))}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {petLabels[locale]?.[key] ?? key}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2">
                    {es ? "Rango de precio" : "Price range"}
                  </p>
                  <div className="flex items-center gap-2 max-w-xs">
                    <Input
                      type="number"
                      min={0}
                      placeholder={es ? "Min €" : "Min €"}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="text-center"
                    />
                    <span className="text-stone-400 text-sm">-</span>
                    <Input
                      type="number"
                      min={0}
                      placeholder={es ? "Max €" : "Max €"}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Verified only */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={verifiedOnly}
                    onClick={() => setVerifiedOnly((v) => !v)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      verifiedOnly
                        ? "bg-green-600 border-green-600"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {verifiedOnly && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <label
                    className="text-sm text-stone-700 cursor-pointer select-none"
                    onClick={() => setVerifiedOnly((v) => !v)}
                  >
                    <Shield className="w-3.5 h-3.5 text-green-500 inline mr-1" />
                    {es ? "Solo verificados" : "Verified only"}
                  </label>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-3.5 h-3.5" />
                    {es ? "Limpiar filtros" : "Clear filters"}
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Results header with view toggle */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-stone-400">
              {filteredSitters.length !== sitters.length
                ? `${filteredSitters.length} / ${sitters.length} ${es ? "cuidadores" : "sitters"}`
                : `${sitters.length} ${es ? "cuidadores encontrados" : "sitters found"}`}
            </p>
            <div className="flex rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "split" ? "bg-green-50 text-green-700" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <span className="hidden sm:inline">{es ? "Ambos" : "Both"}</span>
                <span className="sm:hidden">⊞</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-stone-200 transition-colors ${
                  viewMode === "list" ? "bg-green-50 text-green-700" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <List className="w-3.5 h-3.5 inline" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-stone-200 transition-colors ${
                  viewMode === "map" ? "bg-green-50 text-green-700" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <Map className="w-3.5 h-3.5 inline" />
              </button>
            </div>
          </div>

          {/* Split view: list + map */}
          <div className={`mt-3 gap-4 ${
            viewMode === "split" ? "grid lg:grid-cols-2" : ""
          }`}>
            {/* Sitter list */}
            {showList && (
              <div className={`space-y-3 ${viewMode === "split" ? "max-h-[600px] overflow-y-auto pr-1" : ""}`}>
                {filteredSitters.length === 0 ? (
                  <Card className="text-center py-10">
                    <PawPrint className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm text-stone-500">
                      {es
                        ? "Ningún cuidador coincide con los filtros seleccionados."
                        : "No sitters match the selected filters."}
                    </p>
                  </Card>
                ) : (
                  filteredSitters.map((sitter) => (
                    <Link
                      key={sitter.id}
                      href={`/sitter/${sitter.id}`}
                      className="group block rounded-2xl bg-white p-5 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all"
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

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sitter.services.map((service) => (
                          <Badge key={service} variant="stone">
                            {serviceLabels[locale]?.[service] ?? service}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Map — always shows ALL sitters, unfiltered */}
            {showMap && (
              <div className={viewMode === "map" ? "h-[600px]" : "h-[600px] hidden lg:block"}>
                <Suspense fallback={
                  <div className="h-full rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                    <div className="w-8 h-8 border-[3px] border-green-200 border-t-green-600 rounded-full animate-spin" />
                  </div>
                }>
                  <SitterMap sitters={mapSitters} center={searchCenter} />
                </Suspense>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
