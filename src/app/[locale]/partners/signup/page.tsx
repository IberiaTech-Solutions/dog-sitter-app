import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PartnerSignupForm } from "@/components/partner-signup-form";
import { Logo } from "@/components/logo";

export default function PartnerSignupPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden lg:flex lg:w-1/2 bg-brand-soft">
        <div className="flex flex-col justify-center px-12 xl:px-20 py-20 max-w-xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-ink/70">
            {es ? "Para negocios · Gijón" : "For businesses · Gijón"}
          </p>
          <blockquote className="mt-8 font-serif italic text-hero text-brand-ink">
            &ldquo;{t("partners.signupHeroTitle")}&rdquo;
          </blockquote>
          <p className="mt-6 text-lede text-brand-ink/80">
            {t("partners.signupHeroDesc")}
          </p>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Logo size={36} />
                <span className="text-xl font-bold text-ink">
                  {t("common.appName")}
                </span>
              </Link>
              <h1 className="mt-4 font-serif text-h2 font-semibold text-ink">
                {t("partners.signupTitle")}
              </h1>
            </div>

            <PartnerSignupForm />

            <p className="mt-6 pb-4 text-center text-sm text-ink-muted">
              {t("partners.alreadyAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:text-brand-ink transition-colors"
              >
                {t("common.login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
