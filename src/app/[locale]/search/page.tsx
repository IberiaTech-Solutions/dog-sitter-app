import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {t("sitter.nearYou")}
            </h1>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#faf9f7]">
      <Header appName={t("common.appName")} isLoggedIn={false}>
        <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
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
