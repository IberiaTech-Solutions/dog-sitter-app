"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button, Card } from "@/components/ui";

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
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Nombre del partner" : "Partner name"}
          </label>
          <input
            required
            value={form.partner_name}
            onChange={(e) => update("partner_name", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            placeholder="Veterinaria San Marcos"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Tipo" : "Type"}
          </label>
          <select
            value={form.partner_type}
            onChange={(e) => update("partner_type", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
          >
            <option value="vet">{es ? "Veterinario" : "Vet"}</option>
            <option value="pet_shop">{es ? "Tienda" : "Pet shop"}</option>
            <option value="grooming">{es ? "Peluquería" : "Grooming"}</option>
            <option value="other">{es ? "Otro" : "Other"}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Código de descuento" : "Discount code"}
          </label>
          <input
            required
            value={form.discount_code}
            onChange={(e) => update("discount_code", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm font-mono focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            placeholder="VETGIJON10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Porcentaje de descuento" : "Discount %"}
          </label>
          <input
            type="number"
            required
            min="1"
            max="100"
            value={form.discount_percent}
            onChange={(e) => update("discount_percent", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Descripción (español)" : "Description (Spanish)"}
          </label>
          <input
            required
            value={form.description_es}
            onChange={(e) => update("description_es", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            placeholder="10% en primera consulta"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Descripción (inglés)" : "Description (English)"}
          </label>
          <input
            value={form.description_en}
            onChange={(e) => update("description_en", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            placeholder="10% off first visit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {es ? "Ciudad" : "City"}
          </label>
          <input
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
          />
        </div>
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
