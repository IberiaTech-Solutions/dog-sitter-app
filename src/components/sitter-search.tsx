"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { MapPin, Shield, Star, Dog, Cat, Bird, Rabbit, PawPrint, Search, Navigation, ChevronDown, ChevronUp, X } from "lucide-react";
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
  has_insurance: boolean;
  distance_meters: number;
  sitter_lat: number;
  sitter_lng: number;
  bio: string | null;
  city: string | null;
  review_count: number;
  avg_rating: number | null;
  experience_years: number;
};

const serviceLabels: Record<string, Record<string, string>> = {
  es: { dog_walking: "Paseo", pet_sitting: "Cuidado", drop_in: "Visita", overnight: "Noche", daycare: "Guardería" },
  en: { dog_walking: "Walking", pet_sitting: "Sitting", drop_in: "Drop-in", overnight: "Overnight", daycare: "Daycare" },
};

const petIcons: Record<string, typeof Dog> = {
  dog: Dog, cat: Cat, bird: Bird, rabbit: Rabbit,
};

const petLabels: Record<string, Record<string, string>> = {
  es: { dog: "Perro", cat: "Gato", bird: "Pájaro", rabbit: "Conejo", other: "Otro" },
  en: { dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit", other: "Other" },
};

const SERVICE_KEYS = ["dog_walking", "pet_sitting", "drop_in", "overnight", "daycare"] as const;
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
  const [viewMode] = useState<"split" | "list" | "map">("split");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedPets, setSelectedPets] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [sitterExtras, setSitterExtras] = useState<Record<string, { topReview: string | null; repeatClients: number }>>({});
  const [dateTo, setDateTo] = useState("");
  const [availableSitterIds, setAvailableSitterIds] = useState<Set<string> | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Reset availability filter when the user clears dates or results change.
  useEffect(() => {
    if (!dateFrom || sitters.length === 0) setAvailableSitterIds(null);
  }, [dateFrom, sitters.length]);

  // Fetch availability when dates change
  useEffect(() => {
    if (!dateFrom || sitters.length === 0) {
      return;
    }

    const finalTo = dateTo || dateFrom;
    const supabase = createClient();

    async function checkAvailability() {
      const { data } = await supabase
        .from("sitter_availability")
        .select("sitter_id, date, is_available")
        .gte("date", dateFrom)
        .lte("date", finalTo)
        .eq("is_available", true);

      if (!data) { setAvailableSitterIds(null); return; }

      // Count available days per sitter
      const start = new Date(dateFrom);
      const end = new Date(finalTo);
      const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      const counts: Record<string, number> = {};
      data.forEach((row) => {
        counts[row.sitter_id] = (counts[row.sitter_id] || 0) + 1;
      });

      // Only include sitters available for ALL requested days
      const ids = new Set<string>();
      for (const [id, count] of Object.entries(counts)) {
        if (count >= totalDays) ids.add(id);
      }
      setAvailableSitterIds(ids);
    }

    checkAvailability();
  }, [dateFrom, dateTo, sitters]);

  // Fetch top review + repeat clients for search results
  useEffect(() => {
    if (sitters.length === 0) return;
    const supabase = createClient();
    const ids = sitters.map((s) => s.id);

    async function fetchExtras() {
      const [{ data: reviews }, { data: bookings }] = await Promise.all([
        supabase.from("reviews").select("reviewee_id, comment").in("reviewee_id", ids).order("created_at", { ascending: false }),
        supabase.from("bookings").select("sitter_id, owner_id").in("sitter_id", ids).eq("status", "completed"),
      ]);

      const extras: Record<string, { topReview: string | null; repeatClients: number }> = {};

      ids.forEach((id) => {
        const topReview = reviews?.find((r) => r.reviewee_id === id && r.comment)?.comment ?? null;
        const ownerCounts: Record<string, number> = {};
        bookings?.filter((b) => b.sitter_id === id).forEach((b) => {
          ownerCounts[b.owner_id] = (ownerCounts[b.owner_id] || 0) + 1;
        });
        const repeatClients = Object.values(ownerCounts).filter((c) => c > 1).length;
        extras[id] = { topReview, repeatClients };
      });

      setSitterExtras(extras);
    }

    fetchExtras();
  }, [sitters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedServices.size > 0) count++;
    if (selectedPets.size > 0) count++;
    if (priceMin || priceMax) count++;
    if (verifiedOnly) count++;
    if (dateFrom) count++;
    return count;
  }, [selectedServices.size, selectedPets.size, priceMin, priceMax, verifiedOnly, dateFrom]);

  function clearFilters() {
    setSelectedServices(new Set());
    setSelectedPets(new Set());
    setPriceMin("");
    setPriceMax("");
    setVerifiedOnly(false);
    setDateFrom("");
    setDateTo("");
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
      if (availableSitterIds !== null && !availableSitterIds.has(s.id)) return false;
      return true;
    });
  }, [sitters, selectedServices, selectedPets, priceMin, priceMax, verifiedOnly, availableSitterIds]);

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

  // Auto-search if city was passed from landing page (one-shot, guarded by ref).
  useEffect(() => {
    if (!initialCity || autoSearched.current) return;
    autoSearched.current = true;
    const query = initialCity.trim().toLowerCase();
    const coords = CITY_COORDS[query];
    if (coords) {
      searchByCoords(coords.lat, coords.lng);
    } else {
      const match = Object.keys(CITY_COORDS).find((c) => c.includes(query) || query.includes(c));
      if (match) searchByCoords(CITY_COORDS[match].lat, CITY_COORDS[match].lng);
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
      <div className="mt-6 rounded-2xl bg-surface border border-line p-5 shadow-sm">
        <form onSubmit={handleCitySearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder={es ? "Escribe tu ciudad (ej: Gijón, Madrid...)" : "Type your city (e.g. Gijón, Madrid...)"}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-line bg-canvas text-sm placeholder:text-ink-soft focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
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
          <div className="w-10 h-10 border-[3px] border-brand/40 border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-ink-soft">{t("common.loading")}</p>
        </div>
      )}

      {/* No search yet */}
      {!loading && !searched && (
        <Card className="mt-8 text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-brand-soft flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-brand" />
          </div>
          <h3 className="font-semibold text-ink">
            {es ? "Busca cuidadores en tu zona" : "Search for sitters in your area"}
          </h3>
          <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
            {es
              ? "Escribe tu ciudad o usa el GPS para encontrar cuidadores cerca de ti."
              : "Type your city or use GPS to find sitters near you."}
          </p>
        </Card>
      )}

      {/* Empty results */}
      {!loading && searched && sitters.length === 0 && (
        <Card className="mt-8 text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-line/50 flex items-center justify-center mx-auto mb-5">
            <PawPrint className="w-9 h-9 text-ink-soft" />
          </div>
          <h3 className="text-lg font-semibold text-ink">
            {es ? "Aún no hay cuidadores en esta zona" : "No sitters in this area yet"}
          </h3>
          <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">
            {es
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
      )}

      {/* Results with filters + map */}
      {!loading && searched && sitters.length > 0 && (
        <>
          {/* Collapsible filter bar */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="w-full flex items-center justify-between rounded-2xl bg-surface border border-line px-5 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  {es ? "Filtros" : "Filters"}
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="green">{activeFilterCount}</Badge>
                )}
              </div>
              {filtersOpen ? <ChevronUp className="w-4 h-4 text-ink-soft" /> : <ChevronDown className="w-4 h-4 text-ink-soft" />}
            </button>

            {filtersOpen && (
            <div className="mt-2 rounded-2xl bg-surface border border-line p-5 shadow-sm">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {/* Dates */}
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-2">
                    {es ? "Fechas" : "Dates"}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      min={todayStr}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      min={dateFrom || todayStr}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Service type */}
                <div>
                  <p className="text-xs font-medium text-ink-muted mb-2">
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
                            ? "bg-brand text-white hover:bg-brand-ink hover:text-white"
                            : "border border-line text-ink-muted hover:bg-canvas"
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
                  <p className="text-xs font-medium text-ink-muted mb-2">
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
                              ? "bg-brand text-white hover:bg-brand-ink hover:text-white"
                              : "border border-line text-ink-muted hover:bg-canvas"
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
                  <p className="text-xs font-medium text-ink-muted mb-2">
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
                    <span className="text-ink-soft text-sm">-</span>
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
                        ? "bg-brand border-brand"
                        : "border-line bg-surface"
                    }`}
                  >
                    {verifiedOnly && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <label
                    className="text-sm text-ink cursor-pointer select-none"
                    onClick={() => setVerifiedOnly((v) => !v)}
                  >
                    <Shield className="w-3.5 h-3.5 text-brand inline mr-1" />
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
            </div>
            )}
          </div>

          {/* Results count */}
          <p className="mt-4 text-sm text-ink-soft">
            {filteredSitters.length !== sitters.length
              ? `${filteredSitters.length} / ${sitters.length} ${es ? "cuidadores" : "sitters"}`
              : `${sitters.length} ${es ? "cuidadores encontrados" : "sitters found"}`}
          </p>

          {/* Side by side: cards + map */}
          <div className="mt-3 grid lg:grid-cols-2 gap-4">
            {/* Sitter list */}
            {(
              <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
                {filteredSitters.length === 0 ? (
                  <Card className="text-center py-10">
                    <PawPrint className="w-8 h-8 text-ink-soft mx-auto mb-3" />
                    <p className="text-sm text-ink-muted">
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
                      className="group block rounded-2xl bg-surface p-5 border border-line hover:border-ink-soft/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        <Avatar name={sitter.full_name} src={sitter.avatar_url} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-ink truncate group-hover:text-brand-ink transition-colors">
                              {sitter.full_name}
                            </h3>
                            {sitter.is_verified && (
                              <Shield className="w-4 h-4 text-brand shrink-0" />
                            )}
                            {sitter.has_insurance && (
                              <Shield className="w-4 h-4 text-ink-muted shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-ink-soft">
                            {sitter.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {sitter.city}
                              </span>
                            )}
                            <span>{Math.round(sitter.distance_meters / 1000)} km</span>
                            {sitter.experience_years > 0 && (
                              <span>{sitter.experience_years} {es ? "años exp." : "yrs exp."}</span>
                            )}
                          </div>
                          {/* Rating */}
                          {sitter.review_count > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="flex text-warning">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.round(sitter.avg_rating ?? 0) ? "fill-current" : "text-ink-soft"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-ink-muted">
                                {sitter.avg_rating} ({sitter.review_count})
                              </span>
                            </div>
                          )}
                          {/* Repeat clients */}
                          {sitterExtras[sitter.id]?.repeatClients > 0 && (
                            <span className="mt-1 inline-block text-xs text-brand">
                              {sitterExtras[sitter.id].repeatClients} {es ? "clientes repiten" : "repeat clients"}
                            </span>
                          )}
                          {/* Top review */}
                          {sitterExtras[sitter.id]?.topReview && (
                            <p className="mt-1.5 text-xs text-ink-soft italic line-clamp-1">
                              &ldquo;{sitterExtras[sitter.id].topReview}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-ink">
                            {sitter.hourly_rate.toFixed(0)}€
                          </span>
                          <span className="block text-xs text-ink-soft">
                            {t("sitter.perVisit")}
                          </span>
                        </div>
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

            {/* Map */}
            {(
              <div className="h-[400px] lg:h-[600px] lg:sticky lg:top-20">
                <Suspense fallback={
                  <div className="h-full rounded-2xl bg-line/50 border border-line flex items-center justify-center">
                    <div className="w-8 h-8 border-[3px] border-brand/40 border-t-brand rounded-full animate-spin" />
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
