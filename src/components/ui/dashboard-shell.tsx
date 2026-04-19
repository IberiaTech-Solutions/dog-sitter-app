import { Link } from "@/i18n/navigation";
import { ChevronLeft, MessageCircle, Search, CalendarDays, Settings, Dog } from "lucide-react";
import { Avatar } from "./avatar";
import { UserMenu } from "../user-menu";
import { DashboardNav, DashboardBottomNav } from "../dashboard-nav";
import { Logo } from "../logo";

type Props = {
  appName: string;
  locale: string;
  userName: string;
  userRole: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  title?: string;
};

export function DashboardShell({
  appName,
  locale,
  userName,
  userRole,
  avatarUrl,
  children,
  backHref,
  backLabel,
  title,
}: Props) {
  const es = locale === "es";
  const isOwner = userRole === "owner" || userRole === "both";
  const isSitter = userRole === "sitter" || userRole === "both";
  const isAdmin = userRole === "admin";

  const navItemsDef = [
    { href: "/admin", Icon: Settings, label: es ? "Panel" : "Dashboard", show: isAdmin, badge: undefined },
    { href: "/dashboard", Icon: CalendarDays, label: es ? "Reservas" : "Bookings", show: !isAdmin, badge: "bookings" as const },
    { href: "/search", Icon: Search, label: es ? "Buscar" : "Search", show: isOwner && !isAdmin, badge: undefined },
    { href: "/dashboard/pets", Icon: Dog, label: es ? "Mascotas" : "Pets", show: isOwner && !isAdmin, badge: undefined },
    { href: "/dashboard/sitter-setup", Icon: Settings, label: es ? "Servicio" : "Service", show: isSitter && !isAdmin, badge: undefined },
    { href: "/dashboard/messages", Icon: MessageCircle, label: es ? "Mensajes" : "Messages", show: !isAdmin, badge: "messages" as const },
  ].filter((item) => item.show);

  const navItems = navItemsDef.map((item) => ({
    href: item.href,
    label: item.label,
    iconHtml: <item.Icon className="w-4 h-4" />,
    badge: item.badge,
  }));

  const mobileNavItems = navItemsDef.map((item) => ({
    href: item.href,
    label: item.label,
    iconHtml: <item.Icon className="w-5 h-5" />,
    badge: item.badge,
  }));

  return (
    <div className="min-h-screen bg-canvas pb-20 lg:pb-0">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-canvas border-b border-line">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          {/* Left: back button or logo */}
          {backHref ? (
            <div className="flex items-center gap-3">
              <Link
                href={backHref}
                className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink transition-colors -ml-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel ?? (es ? "Volver" : "Back")}</span>
              </Link>
              {title && (
                <span className="text-sm font-semibold text-ink">{title}</span>
              )}
            </div>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="text-lg font-bold text-ink tracking-tight hidden sm:inline">
                {appName}
              </span>
            </Link>
          )}

          {/* Right: desktop nav + avatar */}
          <div className="flex items-center gap-1">
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              <DashboardNav items={navItems} />
            </nav>

            {/* Avatar dropdown */}
            <UserMenu userName={userName} avatarUrl={avatarUrl} locale={locale} userRole={userRole} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-line safe-area-bottom">
        <DashboardBottomNav
          items={mobileNavItems}
          profileSlot={
            <Link
              href="/dashboard/profile"
              className="flex flex-col items-center justify-center gap-0.5 px-3 min-h-12 min-w-12 text-ink-soft hover:text-brand transition-colors"
            >
              <Avatar name={userName} src={avatarUrl} size="sm" className="w-5 h-5 text-[8px]" />
              <span className="text-[10px] font-medium">{es ? "Perfil" : "Profile"}</span>
            </Link>
          }
        />
      </nav>
    </div>
  );
}
