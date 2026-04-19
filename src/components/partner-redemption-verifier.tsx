"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui";
import { Check, XCircle } from "lucide-react";

type Props = {
  initialToken?: string;
  initialOk?: boolean;
  initialError?: string;
};

export function PartnerRedemptionVerifier({ initialToken = "", initialOk = false, initialError }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOk) {
      toast.success(es ? "Canje registrado" : "Redemption recorded");
    }
    if (initialError) {
      const msg =
        initialError === "not_found"
          ? es
            ? "Código no encontrado o no pertenece a tus ofertas"
            : "Code not found or not one of your offers"
          : initialError === "expired"
            ? es
              ? "Este código ha caducado"
              : "This code has expired"
            : initialError === "already_redeemed"
              ? es
                ? "Este código ya fue canjeado"
                : "This code has already been redeemed"
              : es
                ? "No se pudo canjear el código"
                : "Could not redeem the code";
      toast.error(msg);
    }
  }, [initialOk, initialError, es]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    setLoading(true);

    const supabase = createClient();

    // Look up redemption by token (RLS limits to partner's own discounts)
    const { data: redemption } = await supabase
      .from("partner_discount_redemptions")
      .select("id, status, expires_at")
      .eq("redemption_token", trimmed)
      .maybeSingle();

    if (!redemption) {
      router.replace(`/partner/redemptions?error=not_found&token=${encodeURIComponent(trimmed)}`);
      setLoading(false);
      return;
    }

    if (redemption.status === "redeemed") {
      router.replace(`/partner/redemptions?error=already_redeemed&token=${encodeURIComponent(trimmed)}`);
      setLoading(false);
      return;
    }

    if (redemption.expires_at && new Date(redemption.expires_at).getTime() < Date.now()) {
      // Mark as expired for cleanliness (even if RLS permits)
      await supabase
        .from("partner_discount_redemptions")
        .update({ status: "expired" })
        .eq("id", redemption.id);
      router.replace(`/partner/redemptions?error=expired&token=${encodeURIComponent(trimmed)}`);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("partner_discount_redemptions")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", redemption.id);

    if (updateError) {
      router.replace(`/partner/redemptions?error=save_failed&token=${encodeURIComponent(trimmed)}`);
      setLoading(false);
      return;
    }

    setToken("");
    router.replace(`/partner/redemptions?ok=1`);
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="token"
        label={es ? "Código del cliente" : "Customer code"}
        type="text"
        required
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder={es ? "Pega el código aquí" : "Paste the code here"}
        className="font-mono text-xs"
      />
      <p className="text-xs text-ink-soft">
        {es
          ? "Escanea el QR del cliente con la cámara del móvil (opción copiar) o pide que te lea el código."
          : "Scan the customer's QR with your phone camera (copy option), or have them read you the code."}
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-brand/20 min-h-11"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          {loading ? (es ? "Canjeando..." : "Redeeming...") : es ? "Canjear" : "Redeem"}
        </button>
        {token.length > 0 && (
          <button
            type="button"
            onClick={() => setToken("")}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-ink-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors min-h-11"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            {es ? "Limpiar" : "Clear"}
          </button>
        )}
      </div>
    </form>
  );
}
