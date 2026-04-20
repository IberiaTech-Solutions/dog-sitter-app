import { Link } from "@/i18n/navigation";
import { BarChart3, Dog, CalendarDays, Users, Briefcase } from "lucide-react";

type Props = {
  locale: string;
  active: "overview" | "sitters" | "bookings" | "users" | "partners";
  pendingVerifications?: number;
  pendingPartners?: number;
};

export function AdminNav({ locale, active, pendingVerifications, pendingPartners }: Props) {
  const es = locale === "es";
  const items = [
    { key: "overview" as const, href: "/admin", icon: BarChart3, label: es ? "Resumen" : "Overview" },
    { key: "sitters" as const, href: "/admin/sitters", icon: Dog, label: es ? "Cuidadores" : "Sitters" },
    { key: "partners" as const, href: "/admin/partners", icon: Briefcase, label: es ? "Partners" : "Partners" },
    { key: "bookings" as const, href: "/admin/bookings", icon: CalendarDays, label: es ? "Reservas" : "Bookings" },
    { key: "users" as const, href: "/admin/users", icon: Users, label: es ? "Usuarios" : "Users" },
  ];

  const badgeFor = (key: typeof items[number]["key"]): number => {
    if (key === "sitters") return pendingVerifications ?? 0;
    if (key === "partners") return pendingPartners ?? 0;
    return 0;
  };

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
      {items.map((item) => {
        const badge = badgeFor(item.key);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              active === item.key
                ? "bg-brand text-surface shadow-sm shadow-brand/20"
                : "text-ink-muted hover:bg-line/50 hover:text-ink"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-surface">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
