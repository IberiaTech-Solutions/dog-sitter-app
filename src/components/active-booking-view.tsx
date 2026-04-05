"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type VisitLog = {
  id: string;
  event_type: string;
  note: string | null;
  media_url: string | null;
  created_at: string;
};

type Props = {
  bookingId: string;
  isSitter: boolean;
  initialLogs: VisitLog[];
  bookingStatus: string;
};

export function ActiveBookingView({
  bookingId,
  isSitter,
  initialLogs,
  bookingStatus,
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
          setLogs((prev) => [payload.new as VisitLog, ...prev]);
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

  async function handleCheckIn() {
    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    ).catch(() => null);

    await supabase.from("visit_logs").insert({
      booking_id: bookingId,
      sitter_id: user?.id,
      event_type: "check_in",
      ...(position && {
        location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
      }),
    });

    startGpsTracking();
    setSending(false);
  }

  async function handleCheckOut() {
    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    ).catch(() => null);

    await supabase.from("visit_logs").insert({
      booking_id: bookingId,
      sitter_id: user?.id,
      event_type: "check_out",
      ...(position && {
        location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
      }),
    });

    stopGpsTracking();
    setSending(false);
  }

  async function handleSendNote() {
    if (!note.trim()) return;
    setSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("visit_logs").insert({
      booking_id: bookingId,
      sitter_id: user?.id,
      event_type: "health_note",
      note: note.trim(),
    });

    setNote("");
    setSending(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const fileName = `${bookingId}/${Date.now()}-${file.name}`;
    const { data: upload } = await supabase.storage
      .from("visit-photos")
      .upload(fileName, file);

    if (upload) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("visit-photos").getPublicUrl(upload.path);

      await supabase.from("visit_logs").insert({
        booking_id: bookingId,
        sitter_id: user?.id,
        event_type: "photo",
        media_url: publicUrl,
      });
    }

    setSending(false);
    e.target.value = "";
  }

  const isActive =
    bookingStatus === "confirmed" || bookingStatus === "in_progress";

  return (
    <div className="mt-6 space-y-6">
      {/* Sitter controls */}
      {isSitter && isActive && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900">
            {locale === "es" ? "Controles de visita" : "Visit controls"}
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleCheckIn}
              disabled={sending}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {locale === "es" ? "Registrar llegada" : "Check in"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={sending}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-50"
            >
              {locale === "es" ? "Registrar salida" : "Check out"}
            </button>
            <label className="cursor-pointer rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              {locale === "es" ? "Subir foto" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {gpsActive && (
            <p className="mt-3 text-sm text-emerald-600">
              {locale === "es"
                ? "GPS activo — compartiendo ubicación"
                : "GPS active — sharing location"}
            </p>
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
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={handleSendNote}
              disabled={sending || !note.trim()}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {locale === "es" ? "Enviar" : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Visit log timeline */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-zinc-900">
          {locale === "es" ? "Historial de visita" : "Visit log"}
        </h2>

        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
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
                        ? "bg-emerald-500"
                        : log.event_type === "check_out"
                          ? "bg-red-500"
                          : log.event_type === "photo"
                            ? "bg-blue-500"
                            : "bg-zinc-400"
                    }`}
                  />
                  <div className="w-px flex-1 bg-zinc-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-zinc-900">
                    {eventLabels[locale]?.[log.event_type] ?? log.event_type}
                  </p>
                  <p className="text-xs text-zinc-500">
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
                    <p className="mt-1 text-sm text-zinc-700">{log.note}</p>
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
      </div>
    </div>
  );
}
