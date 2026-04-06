"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  MapPin,
  Shield,
  Camera,
  CreditCard,
  Search,
  Star,
  Clock,
  Heart,
  ChevronRight,
  PawPrint,
} from "lucide-react";

export function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <PawPrint className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
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
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center py-16 sm:py-24">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 border border-green-200/60 rounded-full text-sm text-green-700 font-medium mb-6">
                  <Shield className="w-3.5 h-3.5" />
                  {t("home.trustBadge")}
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
                  {t("home.title")}
                </h1>
                <p className="mt-5 text-lg text-stone-500 leading-relaxed max-w-lg">
                  {t("home.subtitle")}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
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
                    <Search className="w-4 h-4" />
                    {t("common.search")}
                  </Link>
                </div>

                {/* Pet quote */}
                <p className="mt-6 text-sm italic text-stone-400">
                  {t("home.heroQuote")}
                </p>

                {/* Stats counters */}
                <div className="mt-8 flex flex-wrap gap-6">
                  {[
                    { value: "150+", label: t("home.statsSitters") },
                    { value: "4.9", label: t("home.statsRating") },
                    { value: "500+", label: t("home.statsUsers") },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                      <p className="text-xs text-stone-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-stone-300/30">
                  <Image src="/images/hero-dog.jpg" alt="Happy golden retriever" fill sizes="(max-width: 1024px) 0px, 50vw" className="object-cover" priority />
                </div>
                <div className="absolute -left-8 bottom-12 bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 border border-stone-100 max-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        {t("home.ctaOwner") === "Find sitters" ? "Sitter arrived" : "Cuidador ha llegado"}
                      </p>
                      <p className="text-xs text-stone-400">14:30 — Gijón</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 top-16 bg-white rounded-2xl p-4 shadow-xl shadow-stone-200/50 border border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-stone-700">5.0</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    {t("home.ctaOwner") === "Find sitters" ? "\"Best sitter ever!\"" : "\"El mejor cuidador!\""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {t("home.ctaOwner") === "Find sitters" ? "How it works" : "Cómo funciona"}
              </h2>
              <p className="mt-4 text-stone-500">
                {t("home.ctaOwner") === "Find sitters"
                  ? "Book a trusted sitter in three simple steps"
                  : "Reserva un cuidador de confianza en tres pasos"}
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                { icon: Search, image: "/images/dogs-playing.jpg", stepEs: "Busca cuidadores", stepEn: "Find sitters", descEs: "Filtra por ubicación, servicios, tipo de mascota y disponibilidad en tu zona.", descEn: "Filter by location, services, pet type, and availability in your area." },
                { icon: CreditCard, image: "/images/cat-relaxing.jpg", stepEs: "Reserva y paga", stepEn: "Book & pay", descEs: "Elige las fechas, confirma el precio y paga de forma segura con tarjeta o Bizum.", descEn: "Choose your dates, confirm the price, and pay securely by card or Bizum." },
                { icon: MapPin, image: "/images/dog-walk.jpg", stepEs: "Sigue la visita", stepEn: "Track the visit", descEs: "Recibe fotos, notas de salud y sigue la ubicación de tu cuidador en tiempo real.", descEn: "Get photos, health notes, and follow your sitter's location in real time." },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-5">
                    <Image src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 flex items-center justify-center mt-0.5">
                      <item.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {t("home.ctaOwner") === "Find sitters" ? item.stepEn : item.stepEs}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                        {t("home.ctaOwner") === "Find sitters" ? item.descEn : item.descEs}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white border-y border-stone-100">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: MapPin, color: "bg-blue-50 text-blue-600", key: "gps" as const },
                { icon: Shield, color: "bg-green-50 text-green-600", key: "verified" as const },
                { icon: Camera, color: "bg-purple-50 text-purple-600", key: "photos" as const },
                { icon: CreditCard, color: "bg-amber-50 text-amber-600", key: "payments" as const },
              ].map(({ icon: Icon, color, key }) => (
                <div key={key} className="group p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${color} mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-stone-900">{t(`home.features.${key}`)}</h3>
                  <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">{t(`home.features.${key}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {t("home.ctaOwner") === "Find sitters"
                  ? "What pets are saying"
                  : "Lo que dicen las mascotas"}
              </h2>
              <p className="mt-3 text-stone-500">
                {t("home.ctaOwner") === "Find sitters"
                  ? "Well, their humans translated for them"
                  : "Bueno, sus humanos tradujeron por ellas"}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { nameEs: "Luna (a través de María)", nameEn: "Luna (via María)", quoteEs: "Mi humana viajó por trabajo y yo me quedé con Sara. Me llevó al parque tres veces al día y me mandó fotos. ¡Repetimos seguro!", quoteEn: "My human traveled for work and I stayed with Sara. She took me to the park three times a day and sent photos. We're definitely doing this again!", rating: 5, pet: "Golden Retriever" },
                { nameEs: "Michi (a través de Carlos)", nameEn: "Michi (via Carlos)", quoteEs: "Soy un gato muy exigente, pero Ana entendió mis horarios de comida y me dejó dormir en mi sitio favorito. Aprobado.", quoteEn: "I'm a very demanding cat, but Ana understood my feeding schedule and let me sleep in my favorite spot. Approved.", rating: 5, pet: "Gato persa" },
                { nameEs: "Rocky (a través de Lucía)", nameEn: "Rocky (via Lucía)", quoteEs: "El GPS me dio tranquilidad total. Vi que Pablo llegó a la hora exacta y sacó a Rocky a pasear por nuestra ruta habitual.", quoteEn: "The GPS gave me total peace of mind. I saw Pablo arrived on time and walked Rocky on our usual route.", rating: 5, pet: "Border Collie" },
              ].map((review, i) => (
                <div key={i} className="rounded-2xl bg-white border border-stone-100 p-6 shadow-sm">
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed italic">
                    &ldquo;{t("home.ctaOwner") === "Find sitters" ? review.quoteEn : review.quoteEs}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-sm font-medium text-stone-900">
                      {t("home.ctaOwner") === "Find sitters" ? review.nameEn : review.nameEs}
                    </p>
                    <p className="text-xs text-stone-400">{review.pet}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee banner */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="rounded-3xl bg-green-50 border border-green-100 p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900">{t("home.guarantee")}</h3>
                  <p className="mt-2 text-green-800 leading-relaxed">{t("home.guaranteeDesc")}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {(["verified", "tracking", "support"] as const).map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-green-800">{t(`home.guaranteePoints.${key}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden aspect-square">
                  <Image src="/images/happy-dog.jpg" alt="Happy dog" width={400} height={400} className="object-cover w-full h-full" />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-square mt-8">
                  <Image src="/images/cat-cute.jpg" alt="Cute cat" width={400} height={400} className="object-cover w-full h-full" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                  {t("home.ctaOwner") === "Find sitters" ? "I deserve the best. And I know it." : "Me merezco lo mejor. Y lo sé."}
                </h2>
                <p className="mt-5 text-stone-500 leading-relaxed">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Every sitter on CuidaMascotas goes through identity verification and background checks. My human always knows I'm in safe paws — with GPS tracking, real-time photos, and health updates throughout every visit."
                    : "Cada cuidador en CuidaMascotas pasa por verificación de identidad y control de antecedentes. Mi humano siempre sabe que estoy en buenas patas — con seguimiento GPS, fotos en tiempo real y notas de salud en cada visita."}
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: Shield, textEs: "Cuidadores verificados con DNI y antecedentes", textEn: "Verified sitters with ID and background checks" },
                    { icon: MapPin, textEs: "Seguimiento GPS de cada visita", textEn: "GPS tracking for every visit" },
                    { icon: Clock, textEs: "Actualizaciones y fotos en tiempo real", textEn: "Real-time updates and photos" },
                  ].map(({ icon: Icon, textEs, textEn }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-stone-700">
                        {t("home.ctaOwner") === "Find sitters" ? textEn : textEs}
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/search" className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-green-600 text-white text-sm font-semibold rounded-2xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-600/25">
                  {t("home.ctaOwner")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA for sitters */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="relative rounded-3xl overflow-hidden">
              <Image src="/images/dog-walk.jpg" alt="" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/70" />
              <div className="relative p-10 sm:p-16 max-w-lg">
                <Heart className="w-10 h-10 text-green-300 mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {t("home.ctaOwner") === "Find sitters" ? "Love animals? Become a sitter" : "¿Te encantan los animales? Hazte cuidador"}
                </h2>
                <p className="mt-3 text-green-100 leading-relaxed">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Set your own schedule and rates. Earn up to €500/month caring for pets in your area. Get verified, build reviews, and do what you love."
                    : "Establece tu propio horario y tarifas. Gana hasta 500€/mes cuidando mascotas en tu zona. Verifica tu perfil, acumula opiniones y haz lo que te gusta."}
                </p>
                <Link href="/signup" className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-green-700 text-sm font-semibold rounded-2xl hover:bg-green-50 active:scale-[0.98] transition-all">
                  {t("home.ctaSitter")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
                  <PawPrint className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-stone-900">{t("common.appName")}</span>
              </div>
              <p className="mt-2 text-xs text-stone-400 max-w-xs">
                {t("home.ctaOwner") === "Find sitters"
                  ? "Trusted pet care across Spain. All sitters verified with background checks."
                  : "Cuidado de mascotas de confianza en toda España. Todos los cuidadores verificados."}
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
