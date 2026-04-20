"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion, MotionConfig, useScroll, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/ui";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const viewportConfig = { once: true, margin: "-80px" };

export default function PartnersRecruitmentPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";
  const { scrollYProgress } = useScroll();

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex flex-col min-h-screen bg-canvas">
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-0.5 bg-brand z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <PublicHeader showBusinessLink={false} />

      <main className="flex-1">
        {/* 1. Hero — text left, photo right. Same grid as landing. */}
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
                  {t("partners.recruitProof")}
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="mt-6 font-serif text-display text-ink font-semibold"
                >
                  {t("partners.recruitTitle")}
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-lede text-ink-muted max-w-xl"
                >
                  {t("partners.recruitPitch")}
                </motion.p>
                <motion.div variants={fadeUp} className="mt-10">
                  <Link
                    href="/partners/signup"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
                  >
                    {t("partners.recruitCta")}
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                variants={fadeUp}
                className="lg:col-span-2 hidden lg:block"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <Image
                    src="/images/happy-dog.jpg"
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

        {/* 2. Why — 3 reasons, editorial cadence matching landing three-path. */}
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
              {t("partners.whyLabel")}
            </motion.p>

            <motion.div
              variants={container}
              className="mt-10 divide-y divide-line border-y border-line"
            >
              {(["why1", "why2", "why3"] as const).map((key) => (
                <motion.div
                  key={key}
                  variants={fadeUp}
                  className="py-8 grid md:grid-cols-5 gap-6 md:gap-10"
                >
                  <h2 className="md:col-span-2 font-serif text-h2 font-semibold text-ink">
                    {t(`partners.${key}Title`)}
                  </h2>
                  <p className="md:col-span-3 text-lg text-ink-muted leading-relaxed max-w-xl">
                    {t(`partners.${key}Desc`)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* 3. How it works — 3 numbered steps, ends with CTA inline (no separate closing section). */}
        <motion.section
          className="border-t border-line bg-surface"
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
              {t("partners.howLabel")}
            </motion.p>

            <motion.ol variants={container} className="mt-10 space-y-10 max-w-3xl">
              {(["how1", "how2", "how3"] as const).map((key, i) => (
                <motion.li key={key} variants={fadeUp} className="flex gap-6">
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
                </motion.li>
              ))}
            </motion.ol>

            <motion.div variants={fadeUp} className="mt-12 pl-0 md:pl-[3.5rem]">
              <Link
                href="/partners/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand text-surface text-sm font-semibold rounded-xl hover:bg-brand-ink active:scale-[0.98] transition-all shadow-sm shadow-brand/20"
              >
                {t("partners.recruitCta")}
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <PublicFooter />
    </div>
    </MotionConfig>
  );
}
