"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Logo } from "./logo";

export function LandingPage() {
  const t = useTranslations();
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get("email"),
      barrio: formData.get("barrio") ?? "",
    };
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Network failures: still show a thank-you. Users don't need to debug.
    }
    setWaitlistSubmitted(true);
  };

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
        {/* 1. Hero — pet-voice emotional line + direct pitch + action, with editorial photo on desktop. */}
        <section>
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-3">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
                  {t("home.heroProof")}
                </p>

                <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-ink font-semibold">
                  <span className="block">{t("home.heroPetLine1")}</span>
                  <span className="block text-ink-muted">
                    {t("home.heroPetLine2")}
                  </span>
                </h1>

                <p className="mt-8 text-lg text-ink-muted leading-relaxed max-w-xl">
                  {t("home.heroPitch")}
                </p>

                <div className="mt-10">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
                  >
                    {t("home.heroCta")}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-2 hidden lg:block">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <Image
                    src="/images/hero-dog.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 0px, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial interlude — full-bleed photo between hero and value props. */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl">
            <div className="relative aspect-[21/9] lg:aspect-[3/1] overflow-hidden">
              <Image
                src="/images/dogs-playing.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. Why sitters join — typographic, no icon-tiles. */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("home.whyLabel")}
            </p>

            <div className="mt-10 space-y-14">
              {(["why1", "why2", "why3"] as const).map((key) => (
                <div key={key}>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight leading-[1.2]">
                    {t(`home.${key}Title`)}
                  </h2>
                  <p className="mt-3 text-lg text-ink-muted leading-relaxed">
                    {t(`home.${key}Desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Local network — placeholder categories until real partners sign. Two-col on desktop with supporting photo. */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
              <div className="lg:col-span-3">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
                  {t("home.partnersLabel")}
                </p>
                <h2 className="mt-6 font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight leading-[1.2]">
                  {t("home.partnersTitle")}
                </h2>
                <p className="mt-4 text-lg text-ink-muted leading-relaxed">
                  {t("home.partnersLead")}
                </p>

                <ul className="mt-10 divide-y divide-line border-y border-line">
                  {(["vet", "grooming", "petshop", "trainer"] as const).map((key) => (
                    <li
                      key={key}
                      className="py-4 font-serif text-lg text-ink"
                    >
                      {t(`home.partnerCategory.${key}`)}
                    </li>
                  ))}
                </ul>

                <p className="mt-10">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-brand hover:text-brand-ink font-medium text-sm"
                  >
                    {t("home.partnersCta")}
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </p>
              </div>

              <div className="lg:col-span-2 hidden lg:block lg:pt-14">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <Image
                    src="/images/happy-dog.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 0px, 35vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Honest about the stage — narrower, aside-like. No fake stats. */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-xl px-5 sm:px-8 py-16 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("home.honestLabel")}
            </p>
            <h2 className="mt-6 font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight leading-[1.2]">
              {t("home.honestTitle")}
            </h2>
            <p className="mt-4 text-base text-ink-muted leading-relaxed">
              {t("home.honestBody")}
            </p>
          </div>
        </section>

        {/* 5. Owner waitlist — quiet, pet-voice atmospheric, direct form. */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
              {t("home.ownerLabel")}
            </p>
            <h2 className="mt-6 font-serif italic text-2xl sm:text-3xl font-semibold text-ink tracking-tight leading-[1.25] max-w-xl">
              {t("home.ownerWaitlistTitle")}
            </h2>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed max-w-2xl">
              {t("home.ownerWaitlistDesc")}
            </p>

            {waitlistSubmitted ? (
              <p className="mt-8 text-base font-medium text-brand-ink">
                {t("home.ownerThanks")}
              </p>
            ) : (
              <form
                onSubmit={handleWaitlistSubmit}
                className="mt-8 flex flex-col gap-3 max-w-md"
              >
                <label className="block">
                  <span className="block text-sm font-medium text-ink mb-1.5">
                    {t("home.ownerEmailLabel")}
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-ink mb-1.5">
                    {t("home.ownerBarrioLabel")}
                  </span>
                  <input
                    type="text"
                    name="barrio"
                    className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20 sm:self-start"
                >
                  {t("home.ownerSubmit")}
                </button>
              </form>
            )}
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
    </div>
  );
}
