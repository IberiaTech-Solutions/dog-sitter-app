"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import { toast } from "sonner";

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

  return (
    <div className="mt-6 space-y-6">
      {/* Sitter controls */}
      {isSitter && isActive && (
        <Card>
          <h2 className="font-semibold text-stone-900">
            {locale === "es" ? "Controles de visita" : "Visit controls"}
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="md"
              disabled={sending}
              onClick={handleCheckOut}
            >
              {locale === "es" ? "Finalizar visita" : "End visit"}
            </Button>
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm border-2 border-green-600 text-green-600 hover:bg-green-50 active:scale-[0.98] transition-all">
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
            <p className="mt-3 text-sm text-green-600">
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
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
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

      {/* Visit log timeline */}
      <Card>
        <h2 className="font-semibold text-stone-900">
          {locale === "es" ? "Historial de visita" : "Visit log"}
        </h2>

        {logs.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">
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
                        ? "bg-green-500"
                        : log.event_type === "check_out"
                          ? "bg-red-500"
                          : log.event_type === "photo"
                            ? "bg-blue-500"
                            : "bg-stone-400"
                    }`}
                  />
                  <div className="w-px flex-1 bg-stone-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-stone-900">
                    {eventLabels[locale]?.[log.event_type] ?? log.event_type}
                  </p>
                  <p className="text-xs text-stone-500">
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
                    <p className="mt-1 text-sm text-stone-700">{log.note}</p>
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
