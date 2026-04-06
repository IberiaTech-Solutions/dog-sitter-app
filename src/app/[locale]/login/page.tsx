import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Left side — pet photo */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/hero-dog.jpg"
          alt="Golden retriever"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white leading-snug">
            {t("home.ctaOwner") === "Find sitters"
              ? "Your pet's happiness starts here"
              : "La felicidad de tu mascota empieza aquí"}
          </h2>
          <p className="mt-2 text-white/70">
            {t("home.subtitle")}
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
  );
}
