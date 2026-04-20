import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { SwRegister } from "@/components/sw-register";
import { PushPrompt } from "@/components/push-prompt";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: `CuidaMascotas · ${t("metaTitle")}`,
    description: t("metaDescription"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <SwRegister />
      <PushPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            color: "var(--color-ink)",
            borderRadius: "16px",
            padding: "16px",
            fontSize: "14px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
          },
        }}
      />
    </NextIntlClientProvider>
  );
}
