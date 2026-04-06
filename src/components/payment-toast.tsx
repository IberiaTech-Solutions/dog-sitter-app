"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export function PaymentToast() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const payment = searchParams.get("payment");
  const es = locale === "es";

  useEffect(() => {
    if (payment === "success") {
      toast.success(es ? "Pago completado" : "Payment completed", {
        description: es
          ? "Tu reserva ha sido confirmada"
          : "Your booking has been confirmed",
      });
    } else if (payment === "cancelled") {
      toast.info(es ? "Pago cancelado" : "Payment cancelled", {
        description: es
          ? "Puedes pagar cuando estés listo"
          : "You can pay when you're ready",
      });
    }
  }, [payment, es]);

  return null;
}
