import { useTranslations } from "next-intl";
import { Header, PageShell } from "@/components/ui";
import { SitterSearch } from "@/components/sitter-search";

export default function SearchPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")}>
        <a href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          {t("common.login")}
        </a>
      </Header>

      <PageShell>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <h1 className="text-2xl font-bold text-stone-900">
            {t("sitter.nearYou")}
          </h1>
        </div>
        <SitterSearch />
      </PageShell>
    </div>
  );
}
