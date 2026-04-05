import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t("common.signup")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            {t("home.subtitle")}
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 flex max-w-md gap-3">
            <input
              type="text"
              placeholder={t("home.searchPlaceholder")}
              className="flex-1 rounded-full border border-zinc-300 px-5 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700">
              {t("common.search")}
            </button>
          </div>

          {/* Trust badge */}
          <p className="mt-6 text-sm text-zinc-500">
            ✓ {t("home.trustBadge")}
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/search"
              className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t("home.ctaOwner")}
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-emerald-600 px-8 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
            >
              {t("home.ctaSitter")}
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-zinc-200 bg-zinc-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(["gps", "verified", "photos", "payments"] as const).map(
                (key) => (
                  <div key={key} className="rounded-xl bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-zinc-900">
                      {t(`home.features.${key}`)}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600">
                      {t(`home.features.${key}Desc`)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-bold text-emerald-600">
              {t("common.appName")}
            </span>
            <nav className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <Link href="/about">{t("footer.about")}</Link>
              <Link href="/terms">{t("footer.terms")}</Link>
              <Link href="/privacy">{t("footer.privacy")}</Link>
              <Link href="/legal">{t("footer.legal")}</Link>
              <Link href="/contact">{t("footer.contact")}</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
