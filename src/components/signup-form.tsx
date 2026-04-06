"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export function SignupForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "sitter">("owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const roles = [
    {
      value: "owner" as const,
      emoji: "🐕",
      label: locale === "es" ? "Busco cuidador" : "I need a sitter",
      desc: locale === "es" ? "Para mi mascota" : "For my pet",
    },
    {
      value: "sitter" as const,
      emoji: "💚",
      label: locale === "es" ? "Quiero cuidar" : "I want to sit",
      desc: locale === "es" ? "Mascotas de otros" : "Others' pets",
    },
  ];

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            {locale === "es" ? "Soy..." : "I am..."}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`relative rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                  role === r.value
                    ? "border-green-500 bg-green-50 shadow-sm shadow-green-100"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <span className="text-2xl block mb-2">{r.emoji}</span>
                <span className="text-sm font-semibold text-stone-900 block">{r.label}</span>
                <span className="text-xs text-stone-500">{r.desc}</span>
                {role === r.value && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1.5">
            {locale === "es" ? "Nombre completo" : "Full name"}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-green-600/20"
        >
          {loading ? t("common.loading") : t("common.signup")}
        </button>

        <p className="text-xs text-stone-400 text-center leading-relaxed">
          {locale === "es"
            ? "Al registrarte, aceptas nuestras Condiciones de uso y Politica de privacidad."
            : "By signing up, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </form>
    </div>
  );
}
