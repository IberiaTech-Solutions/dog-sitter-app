import { Link } from "@/i18n/navigation";
import { LayoutDashboard } from "lucide-react";
import { UserMenu } from "./user-menu";

type Props = {
  appName: string;
  locale: string;
  userName?: string;
  avatarUrl?: string | null;
};

export function AdminHeader({ appName, locale, userName, avatarUrl }: Props) {
  const es = locale === "es";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/icons/icon-192.png" alt="" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-stone-900 tracking-tight hidden sm:inline">
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
