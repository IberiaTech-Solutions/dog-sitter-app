"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, Textarea } from "@/components/ui";
import { Coffee } from "lucide-react";
import { toast } from "sonner";

type Props = {
  sitterId: string;
  sitterName: string;
};

export function MeetGreetButton({ sitterId, sitterName }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/meet-greet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitter_id: sitterId, message, locale }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? (es ? "Error al solicitar" : "Request failed"));
        setLoading(false);
        return;
      }

      toast.success(
        es ? "Solicitud enviada" : "Request sent",
        { description: es ? `${sitterName} recibirá tu solicitud` : `${sitterName} will receive your request` }
      );
      setOpen(false);
      setMessage("");
      router.refresh();
    } catch {
      toast.error(es ? "Error al solicitar" : "Request failed");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <Coffee className="w-4 h-4" />
        {es ? "Conocer al cuidador" : "Meet & greet"}
      </Button>
    );
  }

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center gap-2">
        <Coffee className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-stone-900 text-sm">
          {es ? "Conocer al cuidador" : "Meet & greet"}
        </h3>
      </div>
      <p className="text-xs text-stone-500">
        {es
          ? "Envía un mensaje para coordinar una cita gratuita antes de reservar. Así puedes conocer al cuidador y que conozca a tu mascota."
          : "Send a message to arrange a free meeting before booking. Get to know the sitter and let them meet your pet."}
      </p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={
          es
            ? "Hola, me gustaría conocerte antes de hacer una reserva..."
            : "Hi, I'd like to meet you before making a booking..."
        }
      />
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading || !message.trim()}
          onClick={handleRequest}
        >
          {loading ? (es ? "Enviando..." : "Sending...") : (es ? "Enviar solicitud" : "Send request")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {es ? "Cancelar" : "Cancel"}
        </Button>
      </div>
    </Card>
  );
}
