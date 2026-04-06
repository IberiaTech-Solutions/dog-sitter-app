"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

    await supabase
      .from("sitter_availability")
      .upsert(
        { sitter_id: sitterId, date: dateStr, is_available: newValue },
        { onConflict: "sitter_id,date" }
      );

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
        <h3 className="text-lg font-semibold text-stone-900">
          {monthNames[lang][month]} {year}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames[lang].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">
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
            bgClass = "bg-stone-100 text-stone-300 cursor-default";
          } else if (isAvailable) {
            bgClass = "bg-green-50 text-green-600 border border-green-200";
          } else if (hasEntry && !isAvailable) {
            bgClass = "bg-stone-200 text-stone-500";
          } else {
            bgClass = "bg-stone-100 text-stone-500";
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
                isToday ? "ring-2 ring-green-600 ring-offset-1" : ""
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {isEditable && (
        <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-green-50 border border-green-200" />
            {lang === "es" ? "Disponible" : "Available"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-stone-200" />
            {lang === "es" ? "No disponible" : "Unavailable"}
          </span>
        </div>
      )}
    </Card>
  );
}
