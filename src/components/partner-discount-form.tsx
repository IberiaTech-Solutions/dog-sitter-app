"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui";

type Props = {
  partnerId: string;
  partnerName: string;
  partnerType: string;
  city: string;
};

function generateCode(prefix: string) {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  const clean = prefix.replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase();
  return clean ? `${clean}${random}` : random + random.slice(0, 3);
}

export function PartnerDiscountForm({ partnerId, partnerName, partnerType, city }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";

  const [descriptionEs, setDescriptionEs] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [discountCode, setDiscountCode] = useState(() => generateCode(partnerName));
  const [validUntil, setValidUntil] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pct = parseInt(discountPercent, 10);
    if (!descriptionEs.trim() || !discountCode.trim() || !pct || pct < 1 || pct > 100) {
      toast.error(es ? "Revisa los campos" : "Check the fields");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("partner_discounts").insert({
      partner_id: partnerId,
      partner_name: partnerName,
      partner_type: partnerType,
      city,
      discount_code: discountCode.trim().toUpperCase(),
      discount_percent: pct,
      description_es: descriptionEs.trim(),
      description_en: descriptionEn.trim() || null,
      valid_until: validUntil || null,
      is_active: true,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error(
          es
            ? "Ese código ya existe. Prueba con otro."
            : "That code already exists. Try another."
        );
      } else {
        toast.error(es ? "No se pudo crear la oferta" : "Could not create the offer");
        console.error("[partner-discount] insert failed:", error.message);
      }
      setLoading(false);
      return;
    }

    toast.success(es ? "Oferta creada" : "Offer created");
    setDescriptionEs("");
    setDescriptionEn("");
    setDiscountPercent("10");
    setDiscountCode(generateCode(partnerName));
    setValidUntil("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        id="descriptionEs"
        label={es ? "Descripción (español)" : "Description (Spanish)"}
        rows={2}
        required
        value={descriptionEs}
        onChange={(e) => setDescriptionEs(e.target.value)}
        placeholder={
          es
            ? "Ej. 10% en la primera consulta veterinaria"
            : "e.g. 10% off first vet visit"
        }
      />

      <Textarea
        id="descriptionEn"
        label={es ? "Descripción (inglés) (opcional)" : "Description (English) (optional)"}
        rows={2}
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="discountPercent"
          label={es ? "Porcentaje (%)" : "Percent (%)"}
          type="number"
          min={1}
          max={100}
          required
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
        />
        <Input
          id="validUntil"
          label={es ? "Válido hasta (opcional)" : "Valid until (optional)"}
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
        />
      </div>

      <Input
        id="discountCode"
        label={es ? "Código de la oferta" : "Offer code"}
        type="text"
        required
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
        className="font-mono tracking-wider"
        maxLength={16}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-surface hover:bg-brand-ink active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-brand/20 sm:w-auto sm:px-8 min-h-11"
      >
        {loading
          ? es
            ? "Creando..."
            : "Creating..."
          : es
            ? "Crear oferta"
            : "Create offer"}
      </button>
    </form>
  );
}
