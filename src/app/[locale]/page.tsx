import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-stone-900 tracking-tight">
              {t("common.appName")}
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm shadow-green-600/20"
            >
              {t("common.signup")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-green-100 rounded-full opacity-40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-100 rounded-full opacity-40 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
            <div className="max-w-2xl mx-auto text-center sm:text-left sm:mx-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-6">
                <span>🛡️</span>
                {t("home.trustBadge")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
                {t("home.title")}
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-stone-500 leading-relaxed max-w-lg">
                {t("home.subtitle")}
              </p>

              {/* Search bar */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    📍
                  </span>
                  <input
                    type="text"
                    placeholder={t("home.searchPlaceholder")}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm placeholder:text-stone-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <Link
                  href="/search"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-green-600 text-white text-sm font-semibold rounded-2xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-600/25"
                >
                  {t("common.search")}
                </Link>
              </div>

              {/* Quick stats */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span> GPS en tiempo real
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span> Pagos seguros
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span> Cuidadores verificados
                </span>
              </div>
            </div>

            {/* Hero illustration - right side on desktop */}
            <div className="hidden lg:block absolute right-8 top-16 w-[380px]">
              <div className="relative bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-100 rotate-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🐕</div>
                  <div>
                    <p className="font-semibold text-stone-900">Luna</p>
                    <p className="text-xs text-stone-400">Golden Retriever</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">En visita</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <span>📍</span>
                    <div>
                      <p className="text-xs font-medium text-green-700">Cuidador en camino</p>
                      <p className="text-xs text-green-600">Llega en 5 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <span>📸</span>
                    <div>
                      <p className="text-xs font-medium text-stone-700">Foto recibida</p>
                      <p className="text-xs text-stone-500">Luna jugando en el parque</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <span>🍖</span>
                    <div>
                      <p className="text-xs font-medium text-stone-700">Comida servida</p>
                      <p className="text-xs text-stone-500">14:30 — Todo bien</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 bg-white border-y border-stone-100">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 text-center">
              {t("home.ctaOwner") === "Find sitters" ? "How it works" : "Cómo funciona"}
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                { icon: "🔍", step: "1", titleEs: "Busca cuidadores", titleEn: "Find sitters", descEs: "Filtra por ubicación, servicios y disponibilidad", descEn: "Filter by location, services, and availability" },
                { icon: "📅", step: "2", titleEs: "Reserva y paga", titleEn: "Book & pay", descEs: "Elige las fechas y paga de forma segura", descEn: "Choose dates and pay securely" },
                { icon: "📱", step: "3", titleEs: "Sigue la visita", titleEn: "Track the visit", descEs: "GPS, fotos y notas en tiempo real", descEn: "GPS, photos, and notes in real time" },
              ].map((item) => (
                <div key={item.step} className="relative text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 left-1/2 ml-6 text-xs font-bold text-green-600 bg-green-50 w-6 h-6 rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {t("home.ctaOwner") === "Find sitters" ? item.titleEn : item.titleEs}
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                    {t("home.ctaOwner") === "Find sitters" ? item.descEn : item.descEs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "gps" as const, icon: "📍", color: "bg-blue-50 text-blue-600" },
                { key: "verified" as const, icon: "🛡️", color: "bg-green-50 text-green-600" },
                { key: "photos" as const, icon: "📸", color: "bg-purple-50 text-purple-600" },
                { key: "payments" as const, icon: "💳", color: "bg-amber-50 text-amber-600" },
              ].map(({ key, icon, color }) => (
                <div
                  key={key}
                  className="group p-6 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all"
                >
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl text-xl ${color} mb-4`}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-stone-900">
                    {t(`home.features.${key}`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
                    {t(`home.features.${key}Desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for sitters */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-green-700 p-8 sm:p-12 text-center">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <span className="text-4xl mb-4 block">🐾</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Love animals? Become a sitter"
                    : "¿Te encantan los animales? Hazte cuidador"}
                </h2>
                <p className="mt-3 text-green-100 max-w-md mx-auto">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Set your own schedule, rates, and start earning doing what you love."
                    : "Establece tu propio horario, tarifas y empieza a ganar haciendo lo que te gusta."}
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-green-700 text-sm font-semibold rounded-2xl hover:bg-green-50 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                >
                  {t("home.ctaSitter")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <span className="text-sm font-bold text-stone-900">
                  {t("common.appName")}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-400">
                {t("home.ctaOwner") === "Find sitters"
                  ? "Trusted pet care in Spain"
                  : "Cuidado de mascotas de confianza en España"}
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-400">
              <Link href="/about" className="hover:text-stone-600 transition-colors">{t("footer.about")}</Link>
              <Link href="/terms" className="hover:text-stone-600 transition-colors">{t("footer.terms")}</Link>
              <Link href="/privacy" className="hover:text-stone-600 transition-colors">{t("footer.privacy")}</Link>
              <Link href="/legal" className="hover:text-stone-600 transition-colors">{t("footer.legal")}</Link>
              <Link href="/contact" className="hover:text-stone-600 transition-colors">{t("footer.contact")}</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
