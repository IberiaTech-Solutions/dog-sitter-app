"use client";

import { useState, useRef } from "react";
import type { FormEvent } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowRight, Heart, PawPrint, Store } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/ui";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const wordUp: Variants = {
  hidden: { opacity: 0, y: "0.5em" },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const wordContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const viewportConfig = { once: true, margin: "-80px" };

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ marginRight: "0.25em" }}
        >
          <motion.span variants={wordUp} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const { scrollYProgress } = useScroll();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, 60]);

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
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-0.5 bg-brand z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* 1. Hero */}
        <section>
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
            <motion.div
              initial="hidden"
              animate="show"
              variants={container}
              className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center"
            >
              <div className="lg:col-span-3">
                <motion.p
                  variants={fadeUp}
                  className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted"
                >
                  {t("home.heroProof")}
                </motion.p>

                <motion.h1
                  variants={wordContainer}
                  className="mt-6 font-serif text-display text-ink font-semibold"
                >
                  <AnimatedWords
                    text={t("home.heroPetLine1")}
                    className="block"
                  />
                  <AnimatedWords
                    text={t("home.heroPetLine2")}
                    className="block text-ink-muted"
                  />
                </motion.h1>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 lg:hidden relative rounded-2xl overflow-hidden aspect-[5/3]"
                >
                  <Image
                    src="/images/hero-dog.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 0px"
                    className="object-cover [filter:saturate(0.92)_contrast(1.02)]"
                    priority
                  />
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-lede text-ink-muted max-w-xl"
                >
                  {t("home.heroPitch")}
                </motion.p>

                <motion.div variants={fadeUp} className="mt-10">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
                  >
                    {t("home.heroCta")}
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                ref={heroRef}
                variants={fadeUp}
                style={{ y: heroParallaxY }}
                className="lg:col-span-2 hidden lg:block"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <Image
                    src="/images/hero-dog.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 0px, 40vw"
                    className="object-cover [filter:saturate(0.92)_contrast(1.02)]"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. Three-path — the single, explicit "what brings you here" block. */}
        <motion.section
          className="border-t border-line"
          initial="hidden"
          whileInView="show"
          viewport={viewportConfig}
          variants={container}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted"
            >
              {es ? "¿Qué te trae aquí?" : "What brings you here?"}
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="mt-6 font-serif text-h2 font-semibold text-ink max-w-2xl"
            >
              {es
                ? "Una red, tres formas de entrar."
                : "One network, three ways in."}
            </motion.h2>

            <motion.div variants={container} className="mt-12 divide-y divide-line border-y border-line">
              {/* Owner */}
              <motion.div variants={fadeUp}>
                <Link href="/signup" className="group block py-8 transition-colors">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                        <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                        {es ? "Para dueños" : "For owners"}
                      </p>
                      <p className="mt-3 font-serif italic text-h2 text-ink leading-snug">
                        &ldquo;{es
                          ? "Busco a alguien que cuide mi mascota."
                          : "I'm looking for someone to care for my pet."}&rdquo;
                      </p>
                      <p className="mt-3 text-base text-ink-muted max-w-xl">
                        {es
                          ? "Únete a la lista de espera. Cuando haya cuidadores verificados en tu barrio, te avisamos."
                          : "Join the waitlist. We'll notify you when verified sitters are in your neighborhood."}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-ink-soft group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>

              {/* Sitter */}
              <motion.div variants={fadeUp}>
                <Link href="/signup" className="group block py-8 transition-colors">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                        <PawPrint className="w-3.5 h-3.5" aria-hidden="true" />
                        {es ? "Para cuidadores" : "For sitters"}
                      </p>
                      <p className="mt-3 font-serif italic text-h2 text-ink leading-snug">
                        &ldquo;{es
                          ? "Quiero cuidar mascotas cerca de casa."
                          : "I want to care for pets near home."}&rdquo;
                      </p>
                      <p className="mt-3 text-base text-ink-muted max-w-xl">
                        {es
                          ? "Tú pones precios y horarios. Herramientas reales + red local de descuentos para tus clientes."
                          : "You set prices and schedule. Real tools + local discount network for your clients."}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-ink-soft group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>

              {/* Business */}
              <motion.div variants={fadeUp}>
                <Link href="/partners" className="group block py-8 transition-colors">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                        <Store className="w-3.5 h-3.5" aria-hidden="true" />
                        {es ? "Para negocios" : "For businesses"}
                      </p>
                      <p className="mt-3 font-serif italic text-h2 text-ink leading-snug">
                        &ldquo;{es
                          ? "Tengo un veterinario, tienda o peluquería en Gijón."
                          : "I run a vet, shop, or groomer in Gijón."}&rdquo;
                      </p>
                      <p className="mt-3 text-base text-ink-muted max-w-xl">
                        {es
                          ? "Únete a la red local. Clientes verificados del barrio, sin coste el primer año."
                          : "Join the local network. Verified neighborhood clients, free the first year."}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 text-ink-soft group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Marquee — visual breath between text blocks. */}
        <section
          aria-label={es ? "Categorías de la red" : "Network categories"}
          className="border-t border-line overflow-hidden py-8 bg-canvas"
        >
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            className="flex gap-12 whitespace-nowrap font-serif text-2xl sm:text-3xl text-ink-muted"
          >
            {[
              ...Array(2).fill([
                "Clínicas veterinarias",
                "Peluquerías caninas",
                "Tiendas de mascotas",
                "Adiestradores",
                "Nutricionistas",
                "Paseadores",
                "Guarderías caninas",
                "Residencias",
              ]).flat(),
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-12 shrink-0">
                <span>{item}</span>
                <span aria-hidden="true" className="text-brand/40">·</span>
              </span>
            ))}
          </motion.div>
        </section>

        {/* 3. Editorial billboard — the single "why us" moment. */}
        <motion.section
          className="relative bg-ink text-canvas overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={viewportConfig}
          variants={container}
        >
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
            <Image
              src="/images/dog-walk.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover [filter:saturate(0.4)_contrast(1.05)]"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 py-32 sm:py-48">
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/60"
            >
              {es ? "La diferencia" : "The difference"}
            </motion.p>
            <motion.h2
              variants={wordContainer}
              className="mt-8 font-serif font-semibold leading-[1.02] text-canvas max-w-5xl"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              <AnimatedWords
                text={es ? "Rover conoce tu ciudad." : "Rover knows your city."}
                className="block"
              />
              <AnimatedWords
                text={es ? "Nosotros conocemos tu barrio." : "We know your neighborhood."}
                className="block text-canvas/60"
              />
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-12 text-lede text-canvas/70 max-w-2xl"
            >
              {es
                ? "Una red local real. Cuidadores, veterinarios, tiendas y peluquerías que se conocen entre sí. Sin gigantes globales, sin traducciones automáticas."
                : "A real local network. Sitters, vets, shops, and groomers who know each other. No global giants, no auto-translated copy."}
            </motion.p>
          </div>
        </motion.section>

        {/* 4. Gijón neighborhoods. */}
        <motion.section
          className="border-t border-line"
          initial="hidden"
          whileInView="show"
          viewport={viewportConfig}
          variants={container}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
              <div className="lg:col-span-3">
                <motion.p
                  variants={fadeUp}
                  className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted"
                >
                  {es ? "Empezando aquí" : "Starting here"}
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  className="mt-6 font-serif text-h2 font-semibold text-ink max-w-xl"
                >
                  {es
                    ? "En los barrios de Gijón que conocemos."
                    : "In the Gijón neighborhoods we know."}
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-base text-ink-muted leading-relaxed max-w-xl"
                >
                  {es
                    ? "Empezamos por donde vive el equipo. Vamos abriendo barrio a barrio conforme firmamos veterinarios y cuidadores locales."
                    : "We start where the team lives. Opening neighborhood by neighborhood as we sign local vets and sitters."}
                </motion.p>

                <motion.div
                  variants={container}
                  className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
                >
                  {[
                    "Cimavilla",
                    "El Llano",
                    "La Arena",
                    "Somió",
                    "La Calzada",
                    "El Carmen",
                    "Pumarín",
                    "Contrueces",
                    "Nuevo Gijón",
                  ].map((barrio) => (
                    <motion.span
                      key={barrio}
                      variants={fadeUp}
                      className="font-serif text-xl text-ink-muted"
                    >
                      {barrio}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-sm text-ink-soft"
                >
                  {es ? "¿Tu barrio no está? " : "Neighborhood not listed? "}
                  <a
                    href="mailto:hola@cuidamascotas.es"
                    className="text-brand hover:text-brand-ink font-medium transition-colors"
                  >
                    {es ? "Escríbenos" : "Write us"}
                  </a>
                  {es ? " — vamos en orden." : " — we roll out in order."}
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                className="lg:col-span-2 hidden lg:block lg:pt-10"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <Image
                    src="/images/cat-cute.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 0px, 35vw"
                    className="object-cover [filter:saturate(0.92)_contrast(1.02)]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 5. Owner waitlist. */}
        <motion.section
          className="border-t border-line bg-surface"
          initial="hidden"
          whileInView="show"
          viewport={viewportConfig}
          variants={container}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-24">
            <div className="max-w-3xl">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted"
              >
                {t("home.ownerLabel")}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-6 font-serif italic text-h2 font-semibold text-ink max-w-xl"
              >
                {t("home.ownerWaitlistTitle")}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg text-ink-muted leading-relaxed max-w-2xl"
              >
                {t("home.ownerWaitlistDesc")}
              </motion.p>

              {waitlistSubmitted ? (
                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-base font-medium text-brand-ink"
                >
                  {t("home.ownerThanks")}
                </motion.p>
              ) : (
                <motion.form
                  variants={fadeUp}
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
                    className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20 sm:self-start min-h-11"
                  >
                    {t("home.ownerSubmit")}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </motion.section>

        {/* 6. Founder note — closing, short. */}
        <motion.section
          className="border-t border-line"
          initial="hidden"
          whileInView="show"
          viewport={viewportConfig}
          variants={container}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-2xl">
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted"
              >
                {es ? "Quién lo construye" : "Who's building this"}
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mt-6 font-serif text-xl text-ink leading-relaxed"
              >
                {es
                  ? "Soy Javier, de Gijón. Construyo esto pensando en mis vecinos — en la vet de mi familia, en la peluquería canina de la esquina, en los cuidadores que nos acompañan desde hace años."
                  : "I'm Javier, from Gijón. I'm building this for my neighborhood — the family vet, the groomer on the corner, the sitters who've looked after our pets for years."}
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-sm text-ink-muted leading-relaxed"
              >
                {es ? "¿Preguntas o ideas? " : "Questions or ideas? "}
                <a
                  href="mailto:hola@cuidamascotas.es"
                  className="text-brand hover:text-brand-ink font-medium transition-colors"
                >
                  hola@cuidamascotas.es
                </a>
              </motion.p>
            </div>
          </div>
        </motion.section>
      </main>

      <PublicFooter />
    </div>
  );
}
