"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

type PublicHeaderProps = {
  showBusinessLink?: boolean;
  showSittersLink?: boolean;
};

export function PublicHeader({
  showBusinessLink = true,
  showSittersLink = true,
}: PublicHeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-line">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-base font-bold text-ink tracking-tight">
            {t("common.appName")}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {showSittersLink && (
            <Link
              href="/sitters"
              className="hidden sm:inline-flex items-center px-3 py-2.5 min-h-11 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              {es ? "Cuidadores" : "Sitters"}
            </Link>
          )}
          {showBusinessLink && (
            <Link
              href="/partners"
              className="hidden sm:inline-flex items-center px-3 py-2.5 min-h-11 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              {es ? "Negocios" : "Businesses"}
            </Link>
          )}
          <Link
            href="/login"
            className="inline-flex items-center px-3 py-2.5 min-h-11 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            {t("common.login")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <Logo size={24} />
            <span className="font-bold text-ink">{t("common.appName")}</span>
            <span className="text-ink-soft">· Gijón</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
            <Link href="/sitters" className="hover:text-ink transition-colors">
              {es ? "Cuidadores" : "Sitters"}
            </Link>
            <Link href="/partners" className="hover:text-ink transition-colors">
              {es ? "Negocios" : "Businesses"}
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/legal" className="hover:text-ink transition-colors">
              {t("footer.legal")}
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              {t("footer.contact")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
