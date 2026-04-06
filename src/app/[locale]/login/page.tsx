import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { AuthHashHandler } from "@/components/auth-hash-handler";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <>
    <AuthHashHandler />
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Left side — pet photo */}
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
          <h2 className="text-3xl font-bold text-white leading-snug">
            {t("auth.loginHeroTitle")}
          </h2>
          <p className="mt-2 text-white/70">
            {t("auth.loginHeroDesc")}
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/icons/icon-192.png" alt="" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-stone-900">
                {t("common.appName")}
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-stone-900">
              {t("auth.loginTitle")}
            </h1>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-stone-400">
            {t("auth.noAccount")}{" "}
            <Link
              href="/signup"
              className="font-semibold text-green-600 hover:text-green-700 transition-colors"
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
