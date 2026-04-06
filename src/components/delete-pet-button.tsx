"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";

export function DeletePetButton({ petId }: { petId: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const es = locale === "es";

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("pets").delete().eq("id", petId);
    router.push("/dashboard/pets");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">
          {es ? "¿Seguro?" : "Are you sure?"}
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {es ? "Sí, eliminar" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
        >
          {es ? "Cancelar" : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {es ? "Eliminar" : "Delete"}
    </button>
  );
}
