import { useTranslations } from "next-intl";
import { SitterSearch } from "@/components/sitter-search";

export default function SearchPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold text-emerald-600">
            {t("common.appName")}
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              {t("common.login")}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t("sitter.nearYou")}
        </h1>
        <SitterSearch />
      </main>
    </div>
  );
}
