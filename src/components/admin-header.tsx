import { Link } from "@/i18n/navigation";
import { LayoutDashboard } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Logo } from "./logo";

type Props = {
  appName: string;
  locale: string;
  userName?: string;
  avatarUrl?: string | null;
};

export function AdminHeader({ appName, locale, userName, avatarUrl }: Props) {
  const es = locale === "es";

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-line">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-lg font-bold text-ink tracking-tight hidden sm:inline">
              {appName}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">{es ? "Mi panel" : "Dashboard"}</span>
          </Link>
          <UserMenu userName={userName ?? "Admin"} avatarUrl={avatarUrl} locale={locale} userRole="admin" />
        </div>
      </div>
    </header>
  );
}
