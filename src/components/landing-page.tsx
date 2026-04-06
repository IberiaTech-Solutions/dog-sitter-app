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

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["/images/happy-dog.jpg", "/images/cat-cute.jpg", "/images/dogs-playing.jpg"].map((src, i) => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden">
                        <Image src={src} alt="" width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-stone-400 mt-0.5">
                      {t("home.ctaOwner") === "Find sitters"
                        ? "Trusted by pet owners across Spain"
                        : "La confianza de dueños de mascotas en España"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-stone-300/30">
                  <Image src="/images/hero-dog.jpg" alt="Happy golden retriever" fill className="object-cover" priority />
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
                    <Image src={item.image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  {t("home.ctaOwner") === "Find sitters" ? "Your pets deserve the best care" : "Tus mascotas merecen el mejor cuidado"}
                </h2>
                <p className="mt-5 text-stone-500 leading-relaxed">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Every sitter on CuidaMascotas goes through identity verification and background checks. You'll always know your pet is in safe hands — with GPS tracking, real-time photos, and health updates throughout every visit."
                    : "Cada cuidador en CuidaMascotas pasa por verificación de identidad y control de antecedentes. Siempre sabrás que tu mascota está en buenas manos — con seguimiento GPS, fotos en tiempo real y notas de salud durante cada visita."}
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
              <Image src="/images/dog-walk.jpg" alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-800/70" />
              <div className="relative p-10 sm:p-16 max-w-lg">
                <Heart className="w-10 h-10 text-green-300 mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {t("home.ctaOwner") === "Find sitters" ? "Love animals? Become a sitter" : "¿Te encantan los animales? Hazte cuidador"}
                </h2>
                <p className="mt-3 text-green-100 leading-relaxed">
                  {t("home.ctaOwner") === "Find sitters"
                    ? "Set your own schedule and rates. Build your reputation with verified reviews and start earning doing what you love."
                    : "Establece tu propio horario y tarifas. Construye tu reputación con opiniones verificadas y empieza a ganar haciendo lo que te gusta."}
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
