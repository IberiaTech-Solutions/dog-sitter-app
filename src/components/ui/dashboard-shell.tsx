import { Link } from "@/i18n/navigation";
import { ChevronLeft, User, MessageCircle, Search, CalendarDays, Settings, Dog } from "lucide-react";
import Image from "next/image";
import { Avatar } from "./avatar";
import { UserMenu } from "../user-menu";

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
  const isOwner = userRole === "owner";
  const isSitter = userRole === "sitter";

  const navItems = [
    { href: "/dashboard", icon: CalendarDays, label: es ? "Reservas" : "Bookings", show: true },
    { href: "/search", icon: Search, label: es ? "Buscar" : "Search", show: isOwner },
    { href: "/dashboard/pets", icon: Dog, label: es ? "Mascotas" : "Pets", show: isOwner },
    { href: "/dashboard/sitter-setup", icon: Settings, label: es ? "Servicio" : "Service", show: isSitter },
    { href: "/dashboard/messages", icon: MessageCircle, label: es ? "Mensajes" : "Messages", show: true },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-20 lg:pb-0">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
          {/* Left: back button or logo */}
          {backHref ? (
            <div className="flex items-center gap-3">
              <Link
                href={backHref}
                className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 transition-colors -ml-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel ?? (es ? "Volver" : "Back")}</span>
              </Link>
              {title && (
                <span className="text-sm font-semibold text-stone-900">{title}</span>
              )}
            </div>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image src="/icons/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-bold text-stone-900 tracking-tight hidden sm:inline">
                {appName}
              </span>
            </Link>
          )}

          {/* Right: desktop nav + avatar */}
          <div className="flex items-center gap-1">
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Avatar dropdown */}
            <UserMenu userName={userName} avatarUrl={avatarUrl} locale={locale} />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/60 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-stone-400 hover:text-green-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-stone-400 hover:text-green-600 transition-colors"
          >
            <Avatar name={userName} src={avatarUrl} size="sm" className="w-5 h-5 text-[8px]" />
            <span className="text-[10px] font-medium">{es ? "Perfil" : "Profile"}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
