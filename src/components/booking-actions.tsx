"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Check, X, Play, MessageCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

type Props = {
  bookingId: string;
  status: string;
  isSitter: boolean;
  isOwner: boolean;
  otherPersonId: string;
};

export function BookingActions({ bookingId, status, isSitter, isOwner, otherPersonId }: Props) {
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

  // Sitter: accept or decline a requested booking
  if (isSitter && status === "requested") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => updateStatus("accepted")}
        >
          <Check className="w-3.5 h-3.5" />
          {es ? "Aceptar" : "Accept"}
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

  // Sitter: confirm after payment (accepted → confirmed happens via Stripe webhook,
  // but sitter can also start a visit from confirmed)
  if (isSitter && status === "confirmed") {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => updateStatus("in_progress")}
        >
          <Play className="w-3.5 h-3.5" />
          {es ? "Iniciar visita" : "Start visit"}
        </Button>
      </div>
    );
  }

  // Sitter: complete an in-progress visit
  if (isSitter && status === "in_progress") {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled={loading}
        onClick={() => updateStatus("completed")}
      >
        <Check className="w-3.5 h-3.5" />
        {es ? "Completar visita" : "Complete visit"}
      </Button>
    );
  }

  // Owner: cancel a requested or accepted booking (before it's confirmed/paid)
  if (isOwner && (status === "requested" || status === "accepted")) {
    if (cancelling) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">
            {es ? "¿Seguro?" : "Are you sure?"}
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={loading}
            onClick={() => updateStatus("cancelled")}
            className="bg-red-600 hover:bg-red-700 shadow-red-600/20"
          >
            {es ? "Sí, cancelar" : "Yes, cancel"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCancelling(false)}
          >
            {es ? "No" : "No"}
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCancelling(true)}
      >
        <Ban className="w-3.5 h-3.5" />
        {es ? "Cancelar" : "Cancel"}
      </Button>
    );
  }

  // Sitter: accepted booking, waiting for owner payment
  if (isSitter && status === "accepted") {
    return (
      <span className="text-xs text-stone-400 italic">
        {es ? "Esperando pago del dueño" : "Waiting for owner payment"}
      </span>
    );
  }

  return null;
}
