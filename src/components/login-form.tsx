"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    toast.success(t("common.appName"), { description: "Welcome back!" });

    // Check if user is admin and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="rounded-3xl bg-white p-7 sm:p-8 shadow-xl shadow-stone-200/40 border border-stone-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm shadow-green-600/20"
        >
          {loading ? t("common.loading") : t("common.login")}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-stone-400">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.98] transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
