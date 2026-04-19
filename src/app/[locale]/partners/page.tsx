import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

export default function PartnersRecruitmentPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <header className="sticky top-0 z-50 bg-canvas border-b border-line">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-bold text-ink tracking-tight">
              {t("common.appName")}
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-3 py-2.5 min-h-11 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            {t("common.login")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section>
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("partners.recruitProof")}
            </p>
            <h1 className="mt-6 font-serif text-display text-ink font-semibold">
              {t("partners.recruitTitle")}
            </h1>
            <p className="mt-8 text-lede text-ink-muted max-w-2xl">
              {t("partners.recruitPitch")}
            </p>
            <div className="mt-10">
              <Link
                href="/partners/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
              >
                {t("partners.recruitCta")}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why join */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("partners.whyLabel")}
            </p>
            <div className="mt-10 space-y-14">
              {(["why1", "why2", "why3"] as const).map((key) => (
                <div key={key}>
                  <h2 className="font-serif text-h2 font-semibold text-ink">
                    {t(`partners.${key}Title`)}
                  </h2>
                  <p className="mt-3 text-lg text-ink-muted leading-relaxed">
                    {t(`partners.${key}Desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("partners.howLabel")}
            </p>
            <ol className="mt-10 space-y-10">
              {(["how1", "how2", "how3"] as const).map((key, i) => (
                <li key={key} className="flex gap-6">
                  <span className="font-serif text-3xl text-brand-ink shrink-0 leading-none pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      {t(`partners.${key}Title`)}
                    </h3>
                    <p className="mt-2 text-base text-ink-muted leading-relaxed">
                      {t(`partners.${key}Desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-24 text-center">
            <h2 className="font-serif text-h2 font-semibold text-ink max-w-xl mx-auto">
              {t("partners.recruitTitle")}
            </h2>
            <div className="mt-8">
              <Link
                href="/partners/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
              >
                {t("partners.recruitCta")}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm">
              <Logo size={24} />
              <span className="font-bold text-ink">{t("common.appName")}</span>
              <span className="text-ink-soft">· Gijón</span>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
              <Link href="/terms" className="hover:text-ink transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/privacy" className="hover:text-ink transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/contact" className="hover:text-ink transition-colors">
                {t("footer.contact")}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
