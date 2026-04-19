import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PartnerSignupForm } from "@/components/partner-signup-form";
import { PublicHeader, PublicFooter } from "@/components/ui";

export default function PartnerSignupPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <PublicHeader showBusinessLink={false} />

      <main className="flex-1 flex">
        <aside className="hidden lg:flex lg:w-1/2 bg-brand-soft">
          <div className="flex flex-col justify-center px-12 xl:px-20 py-16 max-w-xl mx-auto">
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

        <div className="flex-1">
          <div className="flex min-h-full items-center justify-center px-5 py-12 sm:py-16">
            <div className="w-full max-w-md">
              <h1 className="font-serif text-h2 font-semibold text-ink text-center">
                {t("partners.signupTitle")}
              </h1>

              <div className="mt-8">
                <PartnerSignupForm />
              </div>

              <p className="mt-6 text-center text-sm text-ink-muted">
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
      </main>

      <PublicFooter />
    </div>
  );
}
