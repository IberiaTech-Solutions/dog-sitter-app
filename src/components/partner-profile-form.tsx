"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input, Select, Textarea } from "@/components/ui";

const BUSINESS_TYPES = ["vet", "pet_shop", "grooming", "trainer", "nutritionist", "other"] as const;
type BusinessType = (typeof BUSINESS_TYPES)[number];

type PartnerProfile = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  tax_id: string | null;
  address: string | null;
  city: string;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  description_es: string | null;
  description_en: string | null;
};

export function PartnerProfileForm({ profile }: { profile: PartnerProfile }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";

  const [businessName, setBusinessName] = useState(profile.business_name);
  const [businessType, setBusinessType] = useState<BusinessType>(profile.business_type);
  const [taxId, setTaxId] = useState(profile.tax_id ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [city, setCity] = useState(profile.city);
  const [postalCode, setPostalCode] = useState(profile.postal_code ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [logoUrl, setLogoUrl] = useState(profile.logo_url ?? "");
  const [descriptionEs, setDescriptionEs] = useState(profile.description_es ?? "");
  const [descriptionEn, setDescriptionEn] = useState(profile.description_en ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("partner_profiles")
      .update({
        business_name: businessName.trim(),
        business_type: businessType,
        tax_id: taxId.trim() || null,
        address: address.trim() || null,
        city: city.trim(),
        postal_code: postalCode.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        logo_url: logoUrl.trim() || null,
        description_es: descriptionEs.trim() || null,
        description_en: descriptionEn.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      console.error("[partner-profile] update failed:", error.message);
      toast.error(es ? "No se pudieron guardar los cambios" : "Could not save changes");
      setLoading(false);
      return;
    }

    toast.success(es ? "Cambios guardados" : "Changes saved");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="businessName"
        label={t("partners.formBusinessName")}
        type="text"
        required
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />

      <Select
        id="businessType"
        label={t("partners.formBusinessType")}
        required
        value={businessType}
        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
      >
        {BUSINESS_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`partners.types.${type}`)}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="city"
          label={t("partners.formCity")}
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          id="postalCode"
          label={es ? "Código postal" : "Postal code"}
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>

      <Input
        id="address"
        label={es ? "Dirección" : "Address"}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="taxId"
          label={t("partners.formTaxId")}
          type="text"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value.toUpperCase())}
          className="font-mono"
        />
        <Input
          id="phone"
          label={t("partners.formPhone")}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <Input
        id="website"
        label={t("partners.formWebsite")}
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="https://"
      />

      <Input
        id="logoUrl"
        label={es ? "URL del logo (opcional)" : "Logo URL (optional)"}
        type="url"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        placeholder="https://"
      />

      <Textarea
        id="descriptionEs"
        label={es ? "Descripción (español)" : "Description (Spanish)"}
        rows={3}
        value={descriptionEs}
        onChange={(e) => setDescriptionEs(e.target.value)}
        placeholder={
          es
            ? "Breve descripción de tu negocio, servicios y horario."
            : "Short description of your business, services, and hours."
        }
      />

      <Textarea
        id="descriptionEn"
        label={es ? "Descripción (inglés) (opcional)" : "Description (English) (optional)"}
        rows={3}
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-surface hover:bg-brand-ink active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-brand/20 sm:w-auto sm:px-8 min-h-11"
      >
        {loading ? t("common.loading") : es ? "Guardar cambios" : "Save changes"}
      </button>
    </form>
  );
}
