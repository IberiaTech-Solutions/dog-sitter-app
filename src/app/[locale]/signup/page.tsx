import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/dogs-playing.jpg"
          alt="Dogs playing together"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-serif text-3xl font-semibold text-white leading-snug">
            {t("auth.signupHeroTitle")}
          </h2>
          <p className="mt-2 text-white/80">{t("auth.signupHeroDesc")}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-5 py-6">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Logo size={36} />
                <span className="text-xl font-bold text-ink">
                  {t("common.appName")}
                </span>
              </Link>
              <h1 className="mt-2 text-xl font-bold text-ink">
                {t("auth.signupTitle")}
              </h1>
            </div>

            <SignupForm />

            <p className="mt-4 pb-4 text-center text-sm text-ink-muted">
              {t("auth.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:text-brand-ink transition-colors"
              >
                {t("common.login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
