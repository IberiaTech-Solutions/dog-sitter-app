"use client";

import { useTranslations, useLocale } from "next-intl";
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
} from "lucide-react";

export function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icons/icon-192.png" alt="" width={32} height={32} className="rounded-lg" />
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

                <form
                  action={`/${locale}/search`}
                  className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
                >
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      name="city"
                      aria-label={t("home.searchPlaceholder")}
                      placeholder={t("home.searchPlaceholder")}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm placeholder:text-stone-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 bg-green-600 text-white text-sm font-semibold rounded-2xl hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-600/25"
                  >
                    <Search className="w-4 h-4" />
                    {t("common.search")}
                  </button>
                </form>

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
                        {t("home.sitterArrived")}
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
                    {t("home.bestSitter")}
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
                {t("home.howItWorks")}
              </h2>
              <p className="mt-4 text-stone-500">
                {t("home.howItWorksDesc")}
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                { icon: Search, image: "/images/dogs-playing.jpg", step: t("home.step1"), desc: t("home.step1Desc") },
                { icon: CreditCard, image: "/images/cat-relaxing.jpg", step: t("home.step2"), desc: t("home.step2Desc") },
                { icon: MapPin, image: "/images/dog-walk.jpg", step: t("home.step3"), desc: t("home.step3Desc") },
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
                      <h3 className="font-semibold text-stone-900">{item.step}</h3>
                      <p className="mt-1 text-sm text-stone-500 leading-relaxed">{item.desc}</p>
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
                {t("home.testimonialTitle")}
              </h2>
              <p className="mt-3 text-stone-500">
                {t("home.testimonialSubtitle")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { name: t("home.review1Name"), quote: t("home.review1Quote"), pet: "Golden Retriever" },
                { name: t("home.review2Name"), quote: t("home.review2Quote"), pet: "Gato persa" },
                { name: t("home.review3Name"), quote: t("home.review3Quote"), pet: "Border Collie" },
              ].map((review, i) => (
                <div key={i} className="rounded-2xl bg-white border border-stone-100 p-6 shadow-sm">
                  <div className="flex text-amber-400 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed italic">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-sm font-medium text-stone-900">{review.name}</p>
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
                  {t("home.trustTitle")}
                </h2>
                <p className="mt-5 text-stone-500 leading-relaxed">
                  {t("home.trustDesc")}
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: Shield, text: t("home.trustCheck1") },
                    { icon: MapPin, text: t("home.trustCheck2") },
                    { icon: Clock, text: t("home.trustCheck3") },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-stone-700">{text}</p>
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
                  {t("home.sitterCtaTitle")}
                </h2>
                <p className="mt-3 text-green-100 leading-relaxed">
                  {t("home.sitterCtaDesc")}
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
                <img src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-lg" />
                <span className="text-sm font-bold text-stone-900">{t("common.appName")}</span>
              </div>
              <p className="mt-2 text-xs text-stone-400 max-w-xs">
                {t("home.footerTagline")}
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
