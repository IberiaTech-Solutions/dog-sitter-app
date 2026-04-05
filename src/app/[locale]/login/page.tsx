import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-emerald-600">
            {t("common.appName")}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            {t("auth.loginTitle")}
          </h1>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-zinc-500">
          {t("auth.noAccount")}{" "}
          <Link
            href="/signup"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            {t("common.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
