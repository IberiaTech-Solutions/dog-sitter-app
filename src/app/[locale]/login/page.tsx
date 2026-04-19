import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/login-form";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

  return (
    <>
      <AuthHashHandler />
      <div className="flex min-h-screen bg-canvas">
        <aside className="hidden lg:flex lg:w-1/2 bg-brand-soft">
          <div className="flex flex-col justify-center px-12 xl:px-20 py-20 max-w-xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-ink/70">
              {es ? "Red local · Gijón" : "Local network · Gijón"}
            </p>
            <blockquote className="mt-8 font-serif italic text-hero text-brand-ink">
              &ldquo;{t("auth.loginHeroTitle")}&rdquo;
            </blockquote>
            <p className="mt-6 text-lede text-brand-ink/80">
              {t("auth.loginHeroDesc")}
            </p>
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Logo size={36} />
                <span className="text-xl font-bold text-ink">
                  {t("common.appName")}
                </span>
              </Link>
              <h1 className="mt-6 font-serif text-h2 font-semibold text-ink">
                {t("auth.loginTitle")}
              </h1>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-sm text-ink-muted">
              {t("auth.noAccount")}{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand hover:text-brand-ink transition-colors"
              >
                {t("common.signup")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
