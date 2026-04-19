import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header, PageShell, LinkButton, DashboardShell } from "@/components/ui";
import { SitterSearch } from "@/components/sitter-search";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchContent = (
    <>
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
        {t("sitter.nearYou")}
      </h1>
      <SitterSearch />
    </>
  );

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, avatar_url")
      .eq("id", user.id)
      .single();

    return (
      <DashboardShell
        appName={t("common.appName")}
        locale={locale}
        userName={profile?.full_name ?? ""}
        userRole={profile?.role ?? "owner"}
        avatarUrl={profile?.avatar_url}
      >
        {searchContent}
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Header appName={t("common.appName")} isLoggedIn={false}>
        <Link
          href="/login"
          className="inline-flex items-center px-3 py-2.5 min-h-11 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          {t("common.login")}
        </Link>
        <LinkButton href="/signup" variant="primary" size="sm">
          {t("common.signup")}
        </LinkButton>
      </Header>
      <PageShell>
        {searchContent}
      </PageShell>
    </div>
  );
}
