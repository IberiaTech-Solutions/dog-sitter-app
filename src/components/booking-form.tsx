"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

type Pet = {
  id: string;
  name: string;
  species: string;
};

type Props = {
  sitterId: string;
  sitterRate: number;
  services: string[];
  pets: Pet[];
};

const COMMISSION_RATE = 0.18;

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

export function BookingForm({ sitterId, sitterRate, services, pets }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [serviceType, setServiceType] = useState(services[0] ?? "pet_sitting");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate days and total
  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const subtotal = days * sitterRate;
  const commission = subtotal * COMMISSION_RATE;
  const total = subtotal + commission;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitter_id: sitterId,
          pet_id: petId,
          service_type: serviceType,
          start_date: startDate,
          end_date: endDate,
          daily_rate: sitterRate,
          total_amount: total,
          commission_amount: commission,
          owner_notes: notes,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? (locale === "es" ? "Error al crear la reserva" : "Could not create booking"));
        setLoading(false);
        return;
      }

      toast.success(
        locale === "es" ? "Reserva enviada" : "Booking submitted",
        { description: locale === "es" ? "El cuidador recibirá tu solicitud" : "The sitter will receive your request" }
      );

      // Redirect to dashboard or Stripe
      if (data.url) {
        window.location.href = data.url;
      } else if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
      }
    } catch {
      toast.error(locale === "es" ? "Error al procesar la reserva" : "Booking failed");
      setLoading(false);
    }
  }

  const formatEur = (n: number) =>
    n.toFixed(2).replace(".", ",") + " €";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Service type */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          {t("booking.selectService")}
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {services.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setServiceType(s)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                serviceType === s
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {serviceLabels[locale]?.[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Pet selection */}
      {pets.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700">
            {locale === "es" ? "Mascota" : "Pet"}
          </label>
          <select
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dates */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          {t("booking.selectDates")}
        </label>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500">
              {locale === "es" ? "Inicio" : "Start"}
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">
              {locale === "es" ? "Fin" : "End"}
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-zinc-700">
          {locale === "es" ? "Notas para el cuidador" : "Notes for the sitter"}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder={
            locale === "es"
              ? "Instrucciones especiales, horarios, etc."
              : "Special instructions, schedules, etc."
          }
        />
      </div>

      {/* Price summary */}
      {days > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>
                {formatEur(sitterRate)} x {days}{" "}
                {locale === "es" ? "días" : "days"}
              </span>
              <span>{formatEur(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>{t("booking.commission")} (18%)</span>
              <span>{formatEur(commission)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between font-semibold text-zinc-900">
              <span>{t("booking.total")}</span>
              <span>{formatEur(total)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || days === 0 || !petId}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading
          ? t("common.loading")
          : `${t("booking.confirm")} — ${days > 0 ? formatEur(total) : ""}`}
      </button>
    </form>
  );
}
