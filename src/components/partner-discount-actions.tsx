"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Pause, Play, Trash2 } from "lucide-react";

type Props = {
  discountId: string;
  isActive: boolean;
};

export function PartnerDiscountActions({ discountId, isActive }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("partner_discounts")
      .update({ is_active: !isActive })
      .eq("id", discountId);

    if (error) {
      toast.error(es ? "No se pudo actualizar" : "Could not update");
      setLoading(false);
      return;
    }

    toast.success(
      isActive
        ? es
          ? "Oferta pausada"
          : "Offer paused"
        : es
          ? "Oferta activada"
          : "Offer activated"
    );
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("partner_discounts")
      .delete()
      .eq("id", discountId);

    if (error) {
      toast.error(es ? "No se pudo eliminar" : "Could not delete");
      setLoading(false);
      return;
    }

    toast.success(es ? "Oferta eliminada" : "Offer deleted");
    router.refresh();
    setLoading(false);
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-danger">
          {es ? "¿Eliminar?" : "Delete?"}
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 text-danger font-medium hover:underline disabled:opacity-50"
        >
          {es ? "Sí" : "Yes"}
        </button>
        <button
          onClick={() => setConfirmingDelete(false)}
          disabled={loading}
          className="px-2 py-1 text-ink-muted hover:text-ink"
        >
          {es ? "No" : "No"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        disabled={loading}
        aria-label={
          isActive
            ? es
              ? "Pausar oferta"
              : "Pause offer"
            : es
              ? "Activar oferta"
              : "Activate offer"
        }
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition-colors disabled:opacity-50"
      >
        {isActive ? (
          <Pause className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Play className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        disabled={loading}
        aria-label={es ? "Eliminar oferta" : "Delete offer"}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-soft hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
