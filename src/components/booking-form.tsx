"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Select, Textarea, Input, Button } from "@/components/ui";

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
    daycare: "Guardería de día",
  },
  en: {
    dog_walking: "Dog walking",
    pet_sitting: "Pet sitting",
    drop_in: "Drop-in visit",
    overnight: "Overnight stay",
    daycare: "Daycare",
  },
};

export function BookingForm({ sitterId, sitterRate, services, pets }: Props) {
  const t = useTranslations();
  const locale = useLocale();
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

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
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
      <Card>
        <label className="block text-sm font-medium text-stone-700">
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
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {serviceLabels[locale]?.[s] ?? s}
            </button>
          ))}
        </div>
      </Card>

      {/* Pet selection */}
      {pets.length > 0 && (
        <Card>
          <Select
            label={locale === "es" ? "Mascota" : "Pet"}
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </Select>
        </Card>
      )}

      {/* Dates */}
      <Card>
        <label className="block text-sm font-medium text-stone-700">
          {t("booking.selectDates")}
        </label>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <Input
            type="date"
            label={locale === "es" ? "Inicio" : "Start"}
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <Input
            type="date"
            label={locale === "es" ? "Fin" : "End"}
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <Textarea
          label={locale === "es" ? "Notas para el cuidador" : "Notes for the sitter"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={
            locale === "es"
              ? "Instrucciones especiales, horarios, etc."
              : "Special instructions, schedules, etc."
          }
        />
      </Card>

      {/* Price summary */}
      {days > 0 && (
        <Card>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>
                {formatEur(sitterRate)} x {days}{" "}
                {locale === "es" ? "días" : "days"}
              </span>
              <span>{formatEur(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{t("booking.commission")} (18%)</span>
              <span>{formatEur(commission)}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex justify-between font-semibold text-stone-900">
              <span>{t("booking.total")}</span>
              <span>{formatEur(total)}</span>
            </div>
          </div>
        </Card>
      )}

      <Button
        type="submit"
        disabled={loading || days === 0 || !petId}
        size="lg"
        className="w-full rounded-full"
      >
        {loading
          ? t("common.loading")
          : `${t("booking.confirm")} — ${days > 0 ? formatEur(total) : ""}`}
      </Button>
    </form>
  );
}
