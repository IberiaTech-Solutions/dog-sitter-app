"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Check, X, Play, Ban, Coffee } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";
import { toast } from "sonner";

type Props = {
  bookingId: string;
  status: string;
  isSitter: boolean;
  isOwner: boolean;
  otherPersonId: string;
  sitterId?: string;
  startDate?: string;
  endDate?: string;
  isMeetGreet?: boolean;
};

export function BookingActions({ bookingId, status, isSitter, isOwner, otherPersonId, sitterId, startDate, endDate, isMeetGreet }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const es = locale === "es";

  async function updateStatus(newStatus: string) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error(es ? "No se pudo actualizar la reserva" : "Could not update booking");
    } else {
      const labels: Record<string, { es: string; en: string }> = {
        accepted: { es: "Reserva aceptada", en: "Booking accepted" },
        confirmed: { es: "Reserva confirmada", en: "Booking confirmed" },
        in_progress: { es: "Visita iniciada", en: "Visit started" },
        completed: { es: "Visita completada", en: "Visit completed" },
        cancelled: { es: "Reserva cancelada", en: "Booking cancelled" },
      };
      toast.success(es ? labels[newStatus]?.es : labels[newStatus]?.en);
    }

    router.refresh();
    setLoading(false);
    setCancelling(false);
  }

  // Sitter: accept or decline a requested booking (already paid by owner)
  if (isSitter && status === "requested") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={async () => {
            if (sitterId && startDate && endDate && !isMeetGreet) {
              setLoading(true);
              const supabase = createClient();
              const { data: overlapping } = await supabase
                .from("bookings")
                .select("id")
                .eq("sitter_id", sitterId)
                .eq("is_meet_greet", false)
                .in("status", ["requested", "confirmed", "in_progress"])
                .lt("start_date", endDate)
                .gt("end_date", startDate)
                .neq("id", bookingId);

              if (overlapping && overlapping.length > 0) {
                toast.error(
                  es
                    ? "Ya tienes una reserva durante estas fechas"
                    : "You already have a booking during these dates"
                );
                setLoading(false);
                return;
              }
              setLoading(false);
            }
            updateStatus("confirmed");
          }}
        >
          <Check className="w-3.5 h-3.5" />
          {es ? "Aceptar" : "Accept"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch("/api/bookings/decline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booking_id: bookingId }),
              });
              const data = await res.json();
              if (data.success) {
                toast.success(es ? "Reserva rechazada y reembolsada" : "Booking declined and refunded");
              } else {
                toast.error(data.error ?? (es ? "Error al rechazar" : "Could not decline"));
              }
            } catch {
              toast.error(es ? "Error al rechazar" : "Could not decline");
            }
            router.refresh();
            setLoading(false);
          }}
        >
          <X className="w-3.5 h-3.5" />
          {es ? "Rechazar" : "Decline"}
        </Button>
      </div>
    );
  }

  // Sitter: start visit (confirmed → in_progress) + auto check-in
  if (isSitter && status === "confirmed") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const supabase = createClient();

            // Auto check-in with GPS
            const position = await new Promise<GeolocationPosition>((resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject)
            ).catch(() => null);

            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from("visit_logs").insert({
              booking_id: bookingId,
              sitter_id: user?.id,
              event_type: "check_in",
              ...(position && {
                location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
              }),
            });

            await updateStatus("in_progress");
          }}
        >
          <Play className="w-3.5 h-3.5" />
          {es ? "Iniciar visita" : "Start visit"}
        </Button>
      </div>
    );
  }

  // Owner: cancel a requested booking (before sitter accepts)
  if (isOwner && status === "requested") {
    if (cancelling) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">
            {es ? "¿Seguro?" : "Are you sure?"}
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={() => updateStatus("cancelled")}
            className="bg-danger hover:bg-danger shadow-danger/20"
          >
            {es ? "Sí, cancelar" : "Yes, cancel"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCancelling(false)}>
            {es ? "No" : "No"}
          </Button>
        </div>
      );
    }

    return (
      <Button variant="ghost" size="sm" onClick={() => setCancelling(true)}>
        <Ban className="w-3.5 h-3.5" />
        {es ? "Cancelar" : "Cancel"}
      </Button>
    );
  }

  // Sitter: accept or decline a meet & greet request
  if (isSitter && status === "meet_greet_requested") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => updateStatus("meet_greet_accepted")}
        >
          <Coffee className="w-3.5 h-3.5" />
          {es ? "Aceptar cita" : "Accept meet"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
        >
          <X className="w-3.5 h-3.5" />
          {es ? "Rechazar" : "Decline"}
        </Button>
      </div>
    );
  }

  // Sitter: mark meet & greet as completed
  if (isSitter && status === "meet_greet_accepted") {
    return (
      <Button
        variant="primary"
        size="sm"
        disabled={loading}
        onClick={() => updateStatus("meet_greet_completed")}
      >
        <Check className="w-3.5 h-3.5" />
        {es ? "Cita completada" : "Meet completed"}
      </Button>
    );
  }

  // Owner: after meet & greet completed, show "Book now" link
  if (isOwner && status === "meet_greet_completed") {
    return (
      <LinkButton href={`/booking/${otherPersonId}`} variant="primary" size="sm">
        {es ? "Reservar ahora" : "Book now"}
      </LinkButton>
    );
  }

  // Owner: cancel a pending meet & greet
  if (isOwner && status === "meet_greet_requested") {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => updateStatus("cancelled")}
      >
        <Ban className="w-3.5 h-3.5" />
        {es ? "Cancelar" : "Cancel"}
      </Button>
    );
  }

  return null;
}
