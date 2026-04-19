"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, Input, Select } from "@/components/ui";

export function DiscountForm() {
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    partner_name: "",
    partner_type: "pet_shop",
    discount_code: "",
    discount_percent: "10",
    description_es: "",
    description_en: "",
    city: "Gijón",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("partner_discounts").insert({
      partner_name: form.partner_name,
      partner_type: form.partner_type,
      discount_code: form.discount_code.toUpperCase(),
      discount_percent: parseInt(form.discount_percent),
      description_es: form.description_es,
      description_en: form.description_en || null,
      city: form.city,
      is_active: true,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setForm({
      partner_name: "",
      partner_type: "pet_shop",
      discount_code: "",
      discount_percent: "10",
      description_es: "",
      description_en: "",
      city: "Gijón",
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          label={es ? "Nombre del partner" : "Partner name"}
          required
          value={form.partner_name}
          onChange={(e) => update("partner_name", e.target.value)}
          placeholder="Veterinaria San Marcos"
        />
        <Select
          label={es ? "Tipo" : "Type"}
          value={form.partner_type}
          onChange={(e) => update("partner_type", e.target.value)}
        >
          <option value="vet">{es ? "Veterinario" : "Vet"}</option>
          <option value="pet_shop">{es ? "Tienda" : "Pet shop"}</option>
          <option value="grooming">{es ? "Peluquería" : "Grooming"}</option>
          <option value="other">{es ? "Otro" : "Other"}</option>
        </Select>
        <Input
          label={es ? "Código de descuento" : "Discount code"}
          required
          value={form.discount_code}
          onChange={(e) => update("discount_code", e.target.value)}
          className="font-mono"
          placeholder="VETGIJON10"
        />
        <Input
          type="number"
          label={es ? "Porcentaje de descuento" : "Discount %"}
          required
          min="1"
          max="100"
          value={form.discount_percent}
          onChange={(e) => update("discount_percent", e.target.value)}
        />
        <Input
          label={es ? "Descripción (español)" : "Description (Spanish)"}
          required
          value={form.description_es}
          onChange={(e) => update("description_es", e.target.value)}
          placeholder="10% en primera consulta"
        />
        <Input
          label={es ? "Descripción (inglés)" : "Description (English)"}
          value={form.description_en}
          onChange={(e) => update("description_en", e.target.value)}
          placeholder="10% off first visit"
        />
        <Input
          label={es ? "Ciudad" : "City"}
          required
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        />
        <div className="flex items-end">
          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? "..." : es ? "Añadir descuento" : "Add discount"}
          </Button>
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm text-danger">{error}</p>
        )}
      </form>
    </Card>
  );
}
