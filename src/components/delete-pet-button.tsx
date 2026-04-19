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
        <span className="text-xs text-ink-muted">
          {es ? "¿Seguro?" : "Are you sure?"}
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-white bg-danger rounded-lg hover:bg-danger disabled:opacity-50 transition-colors"
        >
          {es ? "Sí, eliminar" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs font-medium text-ink-muted bg-line/50 rounded-lg hover:bg-line transition-colors"
        >
          {es ? "Cancelar" : "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {es ? "Eliminar" : "Delete"}
    </button>
  );
}
