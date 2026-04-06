import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SitterSearch } from "@/components/sitter-search";

export default function SearchPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-stone-900 tracking-tight">
              {t("common.appName")}
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              {t("common.login")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <h1 className="text-2xl font-bold text-stone-900">
            {t("sitter.nearYou")}
          </h1>
        </div>
        <SitterSearch />
      </main>
    </div>
  );
}
