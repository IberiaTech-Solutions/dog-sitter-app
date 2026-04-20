"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, Select, Textarea, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const monthNames: Record<string, string[]> = {
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const dayNames: Record<string, string[]> = {
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function BookingForm({ sitterId, sitterRate, services, pets }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";
  const lang = es ? "es" : "en";

  const [serviceType, setServiceType] = useState(services[0] ?? "pet_sitting");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Calendar state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const supabase = createClient();

  const fetchAvailability = useCallback(async () => {
    const firstDay = 1;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startStr = toDateStr(year, month, firstDay);
    const endStr = toDateStr(year, month, lastDay);

    // Also fetch next month for range selection
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextLastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    const nextEndStr = toDateStr(nextYear, nextMonth, nextLastDay);

    const { data } = await supabase
      .from("sitter_availability")
      .select("date, is_available")
      .eq("sitter_id", sitterId)
      .gte("date", startStr)
      .lte("date", nextEndStr);

    const map: Record<string, boolean> = {};
    data?.forEach((row) => {
      map[row.date] = row.is_available;
    });
    setAvailability(map);
  }, [year, month, sitterId, supabase]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Date selection logic
  function handleDayClick(dateStr: string) {
    if (!availability[dateStr]) return; // Not available

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(dateStr);
      setEndDate("");
    } else {
      // Set end date
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate("");
      } else {
        // Check all dates in range are available
        const start = new Date(startDate);
        const end = new Date(dateStr);
        let allAvailable = true;
        const check = new Date(start);
        while (check <= end) {
          const checkStr = toDateStr(check.getFullYear(), check.getMonth(), check.getDate());
          if (!availability[checkStr]) {
            allAvailable = false;
            break;
          }
          check.setDate(check.getDate() + 1);
        }

        if (allAvailable) {
          setEndDate(dateStr);
        } else {
          toast.error(es
            ? "Hay días no disponibles en ese rango"
            : "Some days in that range are unavailable"
          );
          setStartDate(dateStr);
          setEndDate("");
        }
      }
    }
  }

  function isInRange(dateStr: string) {
    if (!startDate || !endDate) return false;
    return dateStr >= startDate && dateStr <= endDate;
  }

  // Calendar navigation
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonthFn() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  // Calculate days and total
  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : startDate && !endDate ? 1 : 0;
  const subtotal = days * sitterRate;
  const commission = subtotal * COMMISSION_RATE;
  const total = subtotal + commission;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    const finalEnd = endDate || startDate;
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
          end_date: finalEnd,
          daily_rate: sitterRate,
          total_amount: total,
          commission_amount: commission,
          owner_notes: notes,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? (es ? "Error al crear la reserva" : "Could not create booking"));
        setLoading(false);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error(es ? "Error al procesar la reserva" : "Booking failed");
      setLoading(false);
    }
  }

  const formatEur = (n: number) => n.toFixed(2).replace(".", ",") + " €";

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Service type */}
      <Card>
        <label className="block text-sm font-medium text-ink">
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
                  ? "border-brand bg-brand-soft text-brand-ink"
                  : "border-line text-ink-muted hover:border-ink-soft/60"
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
            label={es ? "Mascota" : "Pet"}
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

      {/* Date selection calendar */}
      <Card>
        <label className="block text-sm font-medium text-ink mb-1">
          {t("booking.selectDates")}
        </label>
        <p className="text-xs text-ink-soft mb-4">
          {es
            ? startDate && !endDate
              ? "Selecciona el último día"
              : "Selecciona el primer y último día"
            : startDate && !endDate
              ? "Select the last day"
              : "Select the first and last day"}
        </p>

        {/* Calendar */}
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-line/50 text-ink-muted">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-ink">
            {monthNames[lang][month]} {year}
          </span>
          <button type="button" onClick={nextMonthFn} className="p-1.5 rounded-lg hover:bg-line/50 text-ink-muted">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames[lang].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-ink-soft py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;

            const dateStr = toDateStr(year, month, day);
            const isPast = dateStr < todayStr;
            const isAvailable = availability[dateStr] === true;
            const isStart = dateStr === startDate;
            const isEnd = dateStr === endDate;
            const inRange = isInRange(dateStr);
            const isToday = dateStr === todayStr;

            let bgClass: string;
            if (isStart || isEnd) {
              bgClass = "bg-brand text-surface font-bold";
            } else if (inRange) {
              bgClass = "bg-brand-soft text-brand-ink";
            } else if (isPast || !isAvailable) {
              bgClass = "bg-canvas text-ink-soft cursor-not-allowed";
            } else {
              bgClass = "bg-brand-soft text-brand border border-brand/40 cursor-pointer hover:bg-brand-soft";
            }

            const dayLabel = new Date(dateStr).toLocaleDateString(es ? "es-ES" : "en-GB", {
              day: "numeric",
              month: "long",
            });
            const stateLabel = isPast || !isAvailable
              ? (es ? "no disponible" : "unavailable")
              : isStart || isEnd
                ? (es ? "seleccionado" : "selected")
                : inRange
                  ? (es ? "en rango" : "in range")
                  : (es ? "disponible" : "available");

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || !isAvailable}
                aria-pressed={isStart || isEnd || inRange}
                aria-label={`${dayLabel}, ${stateLabel}`}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-colors ${bgClass} ${
                  isToday && !isStart && !isEnd ? "ring-2 ring-brand ring-offset-1" : ""
                }`}
                onClick={() => handleDayClick(dateStr)}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-brand-soft border border-brand/40" />
            {es ? "Disponible" : "Available"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-canvas" />
            {es ? "No disponible" : "Unavailable"}
          </span>
          {startDate && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-brand" />
              {es ? "Seleccionado" : "Selected"}
            </span>
          )}
        </div>

        {/* Selected dates summary */}
        {startDate && (
          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-sm">
            <span className="text-ink-muted">
              {new Date(startDate).toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "short" })}
              {endDate && endDate !== startDate && (
                <> → {new Date(endDate).toLocaleDateString(es ? "es-ES" : "en-GB", { day: "numeric", month: "short" })}</>
              )}
            </span>
            <span className="font-medium text-ink">
              {days} {days === 1 ? (es ? "día" : "day") : (es ? "días" : "days")}
            </span>
          </div>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <Textarea
          label={es ? "Notas para el cuidador" : "Notes for the sitter"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={es
            ? "Instrucciones especiales, horarios, etc."
            : "Special instructions, schedules, etc."}
        />
      </Card>

      {/* Price summary */}
      {days > 0 && (
        <Card>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>{formatEur(sitterRate)} x {days} {es ? "días" : "days"}</span>
              <span>{formatEur(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>{t("booking.commission")} (18%)</span>
              <span>{formatEur(commission)}</span>
            </div>
            <div className="border-t border-line pt-2 flex justify-between font-semibold text-ink">
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
          : `${t("booking.confirm")} · ${days > 0 ? formatEur(total) : ""}`}
      </Button>
    </form>
  );
}
