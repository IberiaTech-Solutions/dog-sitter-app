"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Search, Heart, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

export function SignupForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const es = locale === "es";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"owner" | "sitter">("owner");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allValid = checks.length && checks.upper && checks.lower && checks.number && checks.match;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allValid) {
      toast.error(es ? "Revisa los requisitos de la contraseña" : "Check password requirements");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          locale,
        },
      },
    });

    if (authError || !signUpData.user) {
      toast.error(es ? "No se pudo crear la cuenta. Inténtalo de nuevo." : "Could not create account. Please try again.");
      setLoading(false);
      return;
    }

    // Supabase returns a user with no identities if email already exists (when confirm is off)
    if (signUpData.user.identities?.length === 0) {
      toast.error(es ? "No se pudo crear la cuenta. Inténtalo de nuevo." : "Could not create account. Please try again.");
      setLoading(false);
      return;
    }

    if (referralCode.trim()) {
      await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralCode.trim() }),
      });
    }

    toast.success(es ? "Cuenta creada" : "Account created", {
      description: es ? "Bienvenido a CuidaMascotas" : "Welcome to CuidaMascotas",
    });
    router.push("/");
    router.refresh();
  }

  const roles = [
    {
      value: "owner" as const,
      icon: Search,
      label: es ? "Busco cuidador" : "I need a sitter",
    },
    {
      value: "sitter" as const,
      icon: Heart,
      label: es ? "Quiero cuidar" : "I want to sit",
    },
  ];

  const inputClass = "w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all";

  function CheckItem({ ok, label }: { ok: boolean; label: string }) {
    return (
      <div className="flex items-center gap-1.5">
        {ok ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-stone-300" />}
        <span className={`text-[11px] ${ok ? "text-green-600" : "text-stone-400"}`}>{label}</span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-xl shadow-stone-200/40 border border-stone-100">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Role selection — compact */}
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`relative rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                role === r.value
                  ? "border-green-500 bg-green-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <r.icon className={`w-4 h-4 ${role === r.value ? "text-green-600" : "text-stone-400"}`} />
                <span className="text-sm font-semibold text-stone-900">{r.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1">
            {es ? "Nombre completo" : "Full name"}
          </label>
          <input id="fullName" type="text" required value={fullName}
            onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
            {t("auth.email")}
          </label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu@email.com" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
            {t("auth.password")}
          </label>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
            {es ? "Confirmar contraseña" : "Confirm password"}
          </label>
          <div className="relative">
            <input id="confirmPassword" type={showPassword ? "text" : "password"} required
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <CheckItem ok={checks.length} label={es ? "8+ caracteres" : "8+ chars"} />
            <CheckItem ok={checks.upper} label={es ? "Mayúscula" : "Uppercase"} />
            <CheckItem ok={checks.lower} label={es ? "Minúscula" : "Lowercase"} />
            <CheckItem ok={checks.number} label={es ? "Número" : "Number"} />
            {confirmPassword.length > 0 && (
              <CheckItem ok={checks.match} label={es ? "Coinciden" : "Match"} />
            )}
          </div>
        )}

        <div>
          <label htmlFor="referral" className="block text-sm font-medium text-stone-700 mb-1">
            {es ? "Código de referido (opcional)" : "Referral code (optional)"}
          </label>
          <input id="referral" type="text" value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className={`${inputClass} font-mono tracking-wider`}
            placeholder="ABCD1234" maxLength={8} />
        </div>

        <button type="submit" disabled={loading || !allValid}
          className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-green-600/20">
          {loading ? t("common.loading") : t("common.signup")}
        </button>

        <p className="text-xs text-stone-400 text-center leading-relaxed">
          {es
            ? "Al registrarte, aceptas nuestras Condiciones de uso y Política de privacidad."
            : "By signing up, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </form>
    </div>
  );
}
