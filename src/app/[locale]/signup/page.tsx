import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { PawPrint } from "lucide-react";
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
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white leading-snug">
            {t("home.ctaOwner") === "Find sitters"
              ? "Join thousands of pet lovers"
              : "Únete a miles de amantes de los animales"}
          </h2>
          <p className="mt-2 text-white/70">
            {t("home.ctaOwner") === "Find sitters"
              ? "Whether you need care for your pet or want to become a sitter"
              : "Ya necesites cuidado para tu mascota o quieras ser cuidador"}
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-stone-900">
                {t("common.appName")}
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-stone-900">
              {t("auth.signupTitle")}
            </h1>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-stone-400">
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
  );
}
