import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Left side — pet photo */}
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
          <h2 className="text-3xl font-bold text-white leading-snug">
            {t("auth.signupHeroTitle")}
          </h2>
          <p className="mt-2 text-white/70">
            {t("auth.signupHeroDesc")}
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-5 py-6">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <img src="/icons/icon-192.png" alt="" width={36} height={36} className="rounded-lg" />
                <span className="text-xl font-bold text-stone-900">
                  {t("common.appName")}
                </span>
              </Link>
              <h1 className="mt-2 text-xl font-bold text-stone-900">
                {t("auth.signupTitle")}
              </h1>
            </div>

            <SignupForm />

            <p className="mt-4 pb-4 text-center text-sm text-stone-400">
              {t("auth.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
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
