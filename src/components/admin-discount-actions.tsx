"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Props = {
  discountId: string;
  isActive: boolean;
  partnerName: string;
};

export function AdminDiscountActions({ discountId, isActive, partnerName }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const es = locale === "es";

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("partner_discounts")
      .update({ is_active: !isActive })
      .eq("id", discountId);

    if (error) {
      toast.error(es ? "No se pudo actualizar" : "Could not update");
    } else {
      toast.success(
        isActive
          ? (es ? "Descuento desactivado" : "Discount deactivated")
          : (es ? "Descuento activado" : "Discount activated")
      );
      router.refresh();
    }
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
    } else {
      toast.success(es ? "Descuento eliminado" : "Discount deleted");
      router.refresh();
    }
    setLoading(false);
    setShowConfirm(false);
  }

  const ToggleIcon = isActive ? ToggleRight : ToggleLeft;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          isActive
            ? "text-green-600 hover:text-amber-600 hover:bg-amber-50"
            : "text-stone-400 hover:text-green-600 hover:bg-green-50"
        }`}
      >
        <ToggleIcon className="w-4 h-4" />
      </button>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600">
            {es ? `Eliminar ${partnerName}?` : `Delete ${partnerName}?`}
          </span>
          <Button variant="ghost" size="sm" disabled={loading} onClick={handleDelete} className="!text-red-600 !text-xs">
            {es ? "Si" : "Yes"}
          </Button>
          <Button variant="ghost" size="sm" disabled={loading} onClick={() => setShowConfirm(false)} className="!text-xs">
            No
          </Button>
        </div>
      )}
    </div>
  );
}
