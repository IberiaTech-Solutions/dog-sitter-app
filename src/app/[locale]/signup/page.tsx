import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Left side - decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 to-orange-500 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <span className="text-7xl block mb-6">🏠</span>
          <h2 className="text-3xl font-bold text-white">
            {t("home.ctaOwner") === "Find sitters"
              ? "Join the community"
              : "Forma parte de la comunidad"}
          </h2>
          <p className="mt-3 text-amber-100 text-lg">
            {t("home.ctaOwner") === "Find sitters"
              ? "Whether you need care for your pet or want to become a sitter"
              : "Ya necesites cuidado para tu mascota o quieras ser cuidador"}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            {["🐕", "🐈", "🐇", "🐦", "🐾"].map((emoji, i) => (
              <div key={i} className="bg-white/15 rounded-2xl p-3 backdrop-blur-sm">
                <span className="text-2xl">{emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🐾</span>
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
