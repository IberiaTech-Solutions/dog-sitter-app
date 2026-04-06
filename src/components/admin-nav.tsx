import { Link } from "@/i18n/navigation";
import { BarChart3, Dog, CalendarDays, Users, Tag } from "lucide-react";

type Props = {
  locale: string;
  active: "overview" | "sitters" | "bookings" | "users" | "discounts";
  pendingVerifications?: number;
};

export function AdminNav({ locale, active, pendingVerifications }: Props) {
  const es = locale === "es";
  const items = [
    { key: "overview" as const, href: "/admin", icon: BarChart3, label: es ? "Resumen" : "Overview" },
    { key: "sitters" as const, href: "/admin/sitters", icon: Dog, label: es ? "Cuidadores" : "Sitters" },
    { key: "bookings" as const, href: "/admin/bookings", icon: CalendarDays, label: es ? "Reservas" : "Bookings" },
    { key: "users" as const, href: "/admin/users", icon: Users, label: es ? "Usuarios" : "Users" },
    { key: "discounts" as const, href: "/admin/discounts", icon: Tag, label: es ? "Descuentos" : "Discounts" },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            active === item.key
              ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
          {item.key === "sitters" && (pendingVerifications ?? 0) > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {pendingVerifications}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
