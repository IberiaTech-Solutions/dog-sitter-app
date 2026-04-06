import { Link } from "@/i18n/navigation";
import { PawPrint, LogOut, LayoutDashboard } from "lucide-react";

type Props = {
  appName: string;
  locale: string;
};

export function AdminHeader({ appName, locale }: Props) {
  const es = locale === "es";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <PawPrint className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-stone-900 tracking-tight">
              {appName}
            </span>
          </Link>
          <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
            ADMIN
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">{es ? "Mi panel" : "Dashboard"}</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{es ? "Cerrar sesión" : "Sign out"}</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
