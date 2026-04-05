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

  const roleLabels = {
    owner:
      locale === "es"
        ? "Busco cuidador para mi mascota"
        : "I'm looking for a pet sitter",
    sitter:
      locale === "es"
        ? "Quiero ser cuidador de mascotas"
        : "I want to be a pet sitter",
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3">
          {(["owner", "sitter"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                role === r
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-zinc-700"
          >
            {locale === "es" ? "Nombre completo" : "Full name"}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700"
          >
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700"
          >
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? t("common.loading") : t("common.signup")}
        </button>

        <p className="text-xs text-zinc-400 text-center">
          {locale === "es"
            ? "Al registrarte, aceptas nuestras Condiciones de uso y Política de privacidad."
            : "By signing up, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </form>
    </div>
  );
}
