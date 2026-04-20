"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Search, Heart, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all";

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <Check className="w-3 h-3 text-brand" aria-hidden="true" />
      ) : (
        <X className="w-3 h-3 text-ink-soft/60" aria-hidden="true" />
      )}
      <span
        className={`text-[11px] ${ok ? "text-brand-ink" : "text-ink-muted"}`}
      >
        {label}
      </span>
    </div>
  );
}

export function SignupForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const es = locale === "es";
  const initialRole = searchParams.get("role") === "sitter" ? "sitter" : "owner";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"owner" | "sitter">(initialRole);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allValid =
    checks.length &&
    checks.upper &&
    checks.lower &&
    checks.number &&
    checks.match;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allValid) {
      toast.error(
        es
          ? "Revisa los requisitos de la contraseña"
          : "Check password requirements"
      );
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
      toast.error(
        es
          ? "No se pudo crear la cuenta. Inténtalo de nuevo."
          : "Could not create account. Please try again."
      );
      setLoading(false);
      return;
    }

    if (signUpData.user.identities?.length === 0) {
      toast.error(
        es
          ? "No se pudo crear la cuenta. Inténtalo de nuevo."
          : "Could not create account. Please try again."
      );
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

  async function handleGoogleSignup() {
    const supabase = createClient();
    const params = new URLSearchParams({ locale, role });
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?${params.toString()}`,
      },
    });
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

  return (
    <div className="rounded-2xl bg-surface p-5 sm:p-7 border border-line">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              aria-pressed={role === r.value}
              className={`relative rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                role === r.value
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-ink-soft/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <r.icon
                  className={`w-4 h-4 ${
                    role === r.value ? "text-brand-ink" : "text-ink-soft"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-ink">
                  {r.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-ink mb-1"
          >
            {es ? "Nombre completo" : "Full name"}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-ink mb-1"
          >
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink mb-1"
          >
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-10`}
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
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-ink mb-1"
          >
            {es ? "Confirmar contraseña" : "Confirm password"}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClass} pr-10`}
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
        </div>

        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <CheckItem
              ok={checks.length}
              label={es ? "8+ caracteres" : "8+ chars"}
            />
            <CheckItem ok={checks.upper} label={es ? "Mayúscula" : "Uppercase"} />
            <CheckItem ok={checks.lower} label={es ? "Minúscula" : "Lowercase"} />
            <CheckItem ok={checks.number} label={es ? "Número" : "Number"} />
            {confirmPassword.length > 0 && (
              <CheckItem ok={checks.match} label={es ? "Coinciden" : "Match"} />
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="referral"
            className="block text-sm font-medium text-ink mb-1"
          >
            {es ? "Código de referido (opcional)" : "Referral code (optional)"}
          </label>
          <input
            id="referral"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className={`${inputClass} font-mono tracking-wider`}
            placeholder="ABCD1234"
            maxLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !allValid}
          className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-surface hover:bg-brand-ink active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-brand/20"
        >
          {loading ? t("common.loading") : t("common.signup")}
        </button>

        <p className="text-xs text-ink-muted text-center leading-relaxed">
          {es
            ? "Al registrarte, aceptas nuestras Condiciones de uso y Política de privacidad."
            : "By signing up, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-4 text-ink-muted">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface py-3 text-sm font-medium text-ink hover:bg-canvas active:scale-[0.98] transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}
