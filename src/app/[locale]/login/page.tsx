import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen bg-[#faf9f7]">
      {/* Left side - decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-700 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <span className="text-7xl block mb-6">🐾</span>
          <h2 className="text-3xl font-bold text-white">
            {t("common.appName")}
          </h2>
          <p className="mt-3 text-green-100 text-lg">
            {t("home.subtitle")}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {["🐕", "🐈", "🐦"].map((emoji) => (
              <div key={emoji} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <span className="text-3xl">{emoji}</span>
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
