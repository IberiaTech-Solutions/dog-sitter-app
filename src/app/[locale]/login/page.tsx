import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <>
      <AuthHashHandler />
      <div className="flex min-h-screen bg-canvas">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/images/hero-dog.jpg"
            alt="Golden retriever"
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="font-serif text-3xl font-semibold text-white leading-snug">
              {t("auth.loginHeroTitle")}
            </h2>
            <p className="mt-2 text-white/80">{t("auth.loginHeroDesc")}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Logo size={36} />
                <span className="text-xl font-bold text-ink">
                  {t("common.appName")}
                </span>
              </Link>
              <h1 className="mt-6 font-serif text-2xl font-semibold text-ink">
                {t("auth.loginTitle")}
              </h1>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-sm text-ink-muted">
              {t("auth.noAccount")}{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand hover:text-brand-ink transition-colors"
              >
                {t("common.signup")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
