import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, Briefcase, Megaphone } from "lucide-react";
import { Logo } from "@/components/logo";

type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  email: string;
  description: string;
};

function ContactRow({ icon, label, email, description }: ContactRowProps) {
  return (
    <div className="flex items-start gap-4 pb-8 border-b border-line last:border-0 last:pb-0">
      <div className="shrink-0 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
          {label}
        </p>
        <a
          href={`mailto:${email}`}
          className="mt-2 block font-serif text-2xl text-ink hover:text-brand-ink transition-colors"
        >
          {email}
        </a>
        <p className="mt-2 text-base text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const t = useTranslations();
  const locale = useLocale();
  const es = locale === "es";

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
            className="px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            {t("common.login")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
            {es ? "Contacto" : "Contact"}
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tight text-ink font-semibold">
            {es ? "Hablemos." : "Let's talk."}
          </h1>
          <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-2xl">
            {es
              ? "Somos un equipo local en Gijón. Escríbenos al canal que mejor se ajuste a tu consulta y te respondemos en un par de días."
              : "We're a local team based in Gijón. Reach out via the channel that best fits your question and we'll get back to you within a couple of days."}
          </p>

          <div className="mt-16 space-y-8">
            <ContactRow
              icon={<Mail className="w-5 h-5 text-brand" aria-hidden="true" />}
              label={es ? "Consultas generales" : "General"}
              email="hola@cuidamascotas.es"
              description={
                es
                  ? "Cualquier pregunta sobre cuidadores, reservas o la plataforma."
                  : "Any question about sitters, bookings, or the platform."
              }
            />
            <ContactRow
              icon={<Briefcase className="w-5 h-5 text-brand" aria-hidden="true" />}
              label={es ? "Negocios y partners" : "Partners & businesses"}
              email="partners@cuidamascotas.es"
              description={
                es
                  ? "¿Tienes un veterinario, tienda o peluquería canina en Gijón? Únete a la red de descuentos."
                  : "Vet, pet shop, or groomer in Gijón? Join the partner network."
              }
            />
            <ContactRow
              icon={<Megaphone className="w-5 h-5 text-brand" aria-hidden="true" />}
              label={es ? "Prensa" : "Press"}
              email="prensa@cuidamascotas.es"
              description={
                es
                  ? "Entrevistas e información sobre el proyecto y el lanzamiento local."
                  : "Interviews and information about the project and local launch."
              }
            />
          </div>
        </div>
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
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
