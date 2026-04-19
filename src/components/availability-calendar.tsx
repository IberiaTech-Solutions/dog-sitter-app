"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Props = {
  sitterId: string;
  isEditable: boolean;
};

type AvailabilityRow = {
  id: string;
  date: string;
  is_available: boolean;
};

const monthNames = {
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const dayNames = {
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

function toDateString(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function AvailabilityCalendar({ sitterId, isEditable }: Props) {
  const locale = useLocale();
  const lang = locale === "es" ? "es" : "en";
  const supabase = createClient();

  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const fetchAvailability = useCallback(async () => {
    const startDate = toDateString(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = toDateString(year, month, lastDay);

    const { data } = await supabase
      .from("sitter_availability")
      .select("id, date, is_available")
      .eq("sitter_id", sitterId)
      .gte("date", startDate)
      .lte("date", endDate);

    const map: Record<string, boolean> = {};
    (data as AvailabilityRow[] | null)?.forEach((row) => {
      map[row.date] = row.is_available;
    });
    setAvailability(map);
  }, [year, month, sitterId, supabase]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  async function toggleDay(dateStr: string) {
    if (!isEditable || loading) return;
    setLoading(true);

    const current = availability[dateStr];
    const newValue = current === undefined ? true : !current;

    setAvailability((prev) => ({ ...prev, [dateStr]: newValue }));

    const { error } = await supabase
      .from("sitter_availability")
      .upsert(
        { sitter_id: sitterId, date: dateStr, is_available: newValue },
        { onConflict: "sitter_id,date" }
      );

    if (error) {
      toast.error(locale === "es" ? "Error al guardar" : "Failed to save");
    }
    setLoading(false);
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold text-ink">
          {monthNames[lang][month]} {year}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames[lang].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-ink-soft py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const dateStr = toDateString(year, month, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isAvailable = availability[dateStr] === true;
          const hasEntry = dateStr in availability;

          let bgClass: string;
          if (isPast) {
            bgClass = "bg-line/50 text-ink-soft cursor-default";
          } else if (isAvailable) {
            bgClass = "bg-brand-soft text-brand border border-brand/40";
          } else if (hasEntry && !isAvailable) {
            bgClass = "bg-line text-ink-muted";
          } else {
            bgClass = "bg-line/50 text-ink-muted";
          }

          if (isEditable && !isPast) {
            bgClass += " cursor-pointer hover:opacity-80";
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || !isEditable}
              onClick={() => !isPast && toggleDay(dateStr)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${bgClass} ${
                isToday ? "ring-2 ring-brand ring-offset-1" : ""
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {isEditable && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-brand-soft border border-brand/40" />
              {lang === "es" ? "Disponible" : "Available"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-line" />
              {lang === "es" ? "No disponible" : "Unavailable"}
            </span>
          </div>
          <span className="text-xs text-ink-soft">
            {lang === "es" ? "Se guarda automáticamente" : "Auto-saved"}
          </span>
        </div>
      )}
    </Card>
  );
}
