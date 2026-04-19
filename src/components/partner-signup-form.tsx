"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Input, Select } from "@/components/ui";

const BUSINESS_TYPES = ["vet", "pet_shop", "grooming", "trainer", "nutritionist", "other"] as const;
type BusinessType = (typeof BUSINESS_TYPES)[number];

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <Check className="w-3 h-3 text-brand" aria-hidden="true" />
      ) : (
        <X className="w-3 h-3 text-ink-soft/60" aria-hidden="true" />
      )}
      <span className={`text-[11px] ${ok ? "text-brand-ink" : "text-ink-muted"}`}>
        {label}
      </span>
    </div>
  );
}

export function PartnerSignupForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("vet");
  const [city, setCity] = useState("Gijón");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordValid = checks.length && checks.upper && checks.lower && checks.number;
  const canSubmit =
    businessName.trim().length > 0 &&
    city.trim().length > 0 &&
    contactName.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordValid &&
    termsAccepted;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) {
      toast.error(
        es ? "Revisa los campos requeridos" : "Check the required fields"
      );
      return;
    }
    setLoading(true);

    const supabase = createClient();

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: contactName.trim(),
          role: "partner",
          locale,
        },
      },
    });

    if (authError || !signUpData.user) {
      toast.error(t("partners.formError"));
      setLoading(false);
      return;
    }

    if (signUpData.user.identities?.length === 0) {
      toast.error(t("partners.formError"));
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("partner_profiles")
      .insert({
        id: signUpData.user.id,
        business_name: businessName.trim(),
        business_type: businessType,
        city: city.trim(),
        tax_id: taxId.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
      });

    if (profileError) {
      console.error("[partner-signup] partner_profiles insert failed:", profileError.message);
      toast.error(t("partners.formError"));
      setLoading(false);
      return;
    }

    toast.success(t("partners.signupSuccess"), {
      description: t("partners.signupSuccessDesc"),
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-surface p-5 sm:p-7 border border-line">
      <form onSubmit={handleSubmit} className="space-y-3.5">
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
            id="taxId"
            label={t("partners.formTaxId")}
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="phone"
            label={t("partners.formPhone")}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            id="website"
            label={t("partners.formWebsite")}
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </div>

        <Input
          id="contactName"
          label={t("partners.formContactName")}
          type="text"
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />

        <Input
          id="email"
          label={t("partners.formEmail")}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@negocio.es"
        />

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            {t("partners.formPassword")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-3 pr-11 text-sm placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? es
                    ? "Ocultar contraseña"
                    : "Hide password"
                  : es
                    ? "Mostrar contraseña"
                    : "Show password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <CheckItem ok={checks.length} label={es ? "8+ caracteres" : "8+ chars"} />
              <CheckItem ok={checks.upper} label={es ? "Mayúscula" : "Uppercase"} />
              <CheckItem ok={checks.lower} label={es ? "Minúscula" : "Lowercase"} />
              <CheckItem ok={checks.number} label={es ? "Número" : "Number"} />
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 rounded border-line text-brand focus:ring-brand/25"
            required
          />
          <span className="text-xs text-ink-muted leading-relaxed">
            {t("partners.formTerms")}
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-surface hover:bg-brand-ink active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-brand/20 min-h-11"
        >
          {loading ? t("common.loading") : t("partners.formSubmit")}
        </button>
      </form>
    </div>
  );
}
