"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Ban, RefreshCw } from "lucide-react";

type Props = {
  bookingId: string;
  currentStatus: string;
};

export function AdminBookingActions({ bookingId, currentStatus }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const es = locale === "es";

  const statuses = [
    { value: "requested", label: es ? "Solicitada" : "Requested" },
    { value: "confirmed", label: es ? "Confirmada" : "Confirmed" },
    { value: "in_progress", label: es ? "En curso" : "In progress" },
    { value: "completed", label: es ? "Completada" : "Completed" },
    { value: "cancelled", label: es ? "Cancelada" : "Cancelled" },
  ];

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) {
      setShowMenu(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error(es ? "No se pudo actualizar" : "Could not update");
    } else {
      toast.success(es ? "Estado actualizado" : "Status updated");
      router.refresh();
    }
    setLoading(false);
    setShowMenu(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {es ? "Estado" : "Status"}
      </button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[140px]">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={loading}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                s.value === currentStatus
                  ? "font-semibold text-green-600"
                  : "text-stone-700"
              }`}
            >
              {s.label}
              {s.value === currentStatus && " ✓"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
