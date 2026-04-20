"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { extractLocations } from "./sitter-live-map";

const SitterLiveMap = dynamic(
  () => import("./sitter-live-map").then((m) => ({ default: m.SitterLiveMap })),
  { ssr: false }
);

type VisitLog = {
  id: string;
  event_type: string;
  location: string | null;
  note: string | null;
  media_url: string | null;
  created_at: string;
};

type Props = {
  bookingId: string;
  isSitter: boolean;
  initialLogs: VisitLog[];
  bookingStatus: string;
  sitterName?: string;
};

export function ActiveBookingView({
  bookingId,
  isSitter,
  initialLogs,
  bookingStatus,
  sitterName,
}: Props) {
  const locale = useLocale();
  const supabase = createClient();
  const [logs, setLogs] = useState<VisitLog[]>(initialLogs);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const eventLabels: Record<string, Record<string, string>> = {
    es: {
      check_in: "Llegada",
      check_out: "Salida",
      photo: "Foto",
      video: "Vídeo",
      health_note: "Nota de salud",
      location_update: "Ubicación actualizada",
    },
    en: {
      check_in: "Check in",
      check_out: "Check out",
      photo: "Photo",
      video: "Video",
      health_note: "Health note",
      location_update: "Location update",
    },
  };

  // Subscribe to realtime visit log updates
  useEffect(() => {
    const channel = supabase
      .channel(`visit-logs-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visit_logs",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newLog = payload.new as VisitLog;
          setLogs((prev) =>
            prev.some((l) => l.id === newLog.id) ? prev : [newLog, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  // GPS tracking for sitters
  function startGpsTracking() {
    if (!navigator.geolocation || !isSitter) return;
    setGpsActive(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from("visit_logs").insert({
          booking_id: bookingId,
          sitter_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: "location_update",
          location: `SRID=4326;POINT(${pos.coords.longitude} ${pos.coords.latitude})`,
        });
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  }

  function stopGpsTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }

  async function insertLog(eventType: string, extra?: { note?: string; location?: string }) {
    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("visit_logs")
      .insert({
        booking_id: bookingId,
        sitter_id: user?.id,
        event_type: eventType,
        ...extra,
      })
      .select()
      .single();

    if (data) {
      setLogs((prev) => [data as VisitLog, ...prev]);
    }
    setSending(false);
    return data;
  }

  async function handleCheckIn() {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    ).catch(() => null);

    await insertLog("check_in", position ? {
      location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
    } : undefined);

    startGpsTracking();
  }

  async function handleCheckOut() {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    ).catch(() => null);

    await insertLog("check_out", position ? {
      location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
    } : undefined);

    stopGpsTracking();
  }

  async function handleSendNote() {
    if (!note.trim()) return;
    await insertLog("health_note", { note: note.trim() });
    setNote("");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${bookingId}/${Date.now()}-${safeName}`;
    const { data: upload, error: uploadError } = await supabase.storage
      .from("visit-photos")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(locale === "es" ? "Error al subir la foto" : "Photo upload failed");
      setSending(false);
      e.target.value = "";
      return;
    }

    if (upload) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("visit-photos").getPublicUrl(upload.path);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("visit_logs")
        .insert({
          booking_id: bookingId,
          sitter_id: user?.id,
          event_type: "photo",
          media_url: publicUrl,
        })
        .select()
        .single();

      if (data) {
        setLogs((prev) => [data as VisitLog, ...prev]);
      }
    }

    setSending(false);
    e.target.value = "";
  }

  const isActive =
    bookingStatus === "confirmed" || bookingStatus === "in_progress";

  // Determine if sitter is currently checked in (from most recent check event)
  const lastCheckEvent = logs.find(
    (l) => l.event_type === "check_in" || l.event_type === "check_out"
  );
  const isCheckedIn = lastCheckEvent?.event_type === "check_in";

  // Count completed visits (check_out events)
  const completedVisits = logs.filter((l) => l.event_type === "check_out").length;

  async function handleCompleteBooking() {
    setSending(true);
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);
    toast.success(locale === "es" ? "Reserva completada" : "Booking completed");
    window.location.reload();
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Sitter controls */}
      {isSitter && isActive && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">
              {locale === "es" ? "Visita de hoy" : "Today's visit"}
            </h2>
            {completedVisits > 0 && (
              <span className="text-xs text-ink-soft">
                {completedVisits} {locale === "es" ? "visita(s) completada(s)" : "visit(s) completed"}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!isCheckedIn ? (
              <Button
                variant="primary"
                size="md"
                disabled={sending}
                onClick={handleCheckIn}
              >
                {locale === "es" ? "Llegada" : "Check in"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                disabled={sending}
                onClick={handleCheckOut}
              >
                {locale === "es" ? "Salida" : "Check out"}
              </Button>
            )}
            {isCheckedIn && (
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm border-2 border-brand text-brand hover:bg-brand-soft active:scale-[0.98] transition-all">
                {locale === "es" ? "Subir foto" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {gpsActive && (
            <p className="mt-3 text-sm text-brand">
              {locale === "es"
                ? "GPS activo, compartiendo ubicación"
                : "GPS active, sharing location"}
            </p>
          )}

          {/* Complete booking — only when not currently checked in and at least one visit done */}
          {!isCheckedIn && completedVisits > 0 && (
            <div className="mt-5 pt-5 border-t border-line">
              <p className="text-sm text-ink-muted mb-3">
                {locale === "es"
                  ? "¿Es el último día? Marca la reserva como completada."
                  : "Last day? Mark the booking as complete."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                disabled={sending}
                onClick={handleCompleteBooking}
              >
                {locale === "es" ? "Completar reserva" : "Complete booking"}
              </Button>
            </div>
          )}

          {/* Health note input */}
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                locale === "es"
                  ? "Nota de salud o alimentación..."
                  : "Health or feeding note..."
              }
              className="flex-1 rounded-xl border border-line bg-canvas px-4 py-3 text-sm focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            />
            <Button
              variant="primary"
              size="md"
              disabled={sending || !note.trim()}
              onClick={handleSendNote}
            >
              {locale === "es" ? "Enviar" : "Send"}
            </Button>
          </div>
        </Card>
      )}

      {/* Live map for owners */}
      {!isSitter && bookingStatus === "in_progress" && (() => {
        const locs = extractLocations(logs);
        return locs.length > 0 ? (
          <Card>
            <h2 className="font-semibold text-ink mb-3">
              {locale === "es" ? "Ubicación en tiempo real" : "Live location"}
            </h2>
            <SitterLiveMap locations={locs} sitterName={sitterName ?? ""} />
          </Card>
        ) : null;
      })()}

      {/* Visit log timeline */}
      <Card>
        <h2 className="font-semibold text-ink">
          {locale === "es" ? "Historial de visita" : "Visit log"}
        </h2>

        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            {locale === "es"
              ? "No hay actividad registrada todavía."
              : "No activity logged yet."}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      log.event_type === "check_in"
                        ? "bg-brand"
                        : log.event_type === "check_out"
                          ? "bg-danger"
                          : log.event_type === "photo"
                            ? "bg-brand"
                            : "bg-ink-soft"
                    }`}
                  />
                  <div className="w-px flex-1 bg-line" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-ink">
                    {eventLabels[locale]?.[log.event_type] ?? log.event_type}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {new Date(log.created_at).toLocaleString(
                      locale === "es" ? "es-ES" : "en-GB",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      }
                    )}
                  </p>
                  {log.note && (
                    <p className="mt-1 text-sm text-ink">{log.note}</p>
                  )}
                  {log.media_url && (
                    <img
                      src={log.media_url}
                      alt=""
                      className="mt-2 h-48 w-auto rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
