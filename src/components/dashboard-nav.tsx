"use client";

import { Link } from "@/i18n/navigation";
import { useNavBadges, NavBadge } from "./nav-badges";

type NavItem = {
  href: string;
  label: string;
  iconHtml: React.ReactNode;
  badge?: "messages" | "bookings";
};

export function DashboardNav({ items }: { items: NavItem[] }) {
  const { unreadMessages, pendingBookings } = useNavBadges();

  function getBadgeCount(badge?: "messages" | "bookings") {
    if (badge === "messages") return unreadMessages;
    if (badge === "bookings") return pendingBookings;
    return 0;
  }

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-ink-muted hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
        >
          {item.iconHtml}
          {item.label}
          <NavBadge count={getBadgeCount(item.badge)} />
        </Link>
      ))}
    </>
  );
}

export function DashboardBottomNav({
  items,
  profileSlot,
}: {
  items: NavItem[];
  profileSlot: React.ReactNode;
}) {
  const { unreadMessages, pendingBookings } = useNavBadges();

  function getBadgeCount(badge?: "messages" | "bookings") {
    if (badge === "messages") return unreadMessages;
    if (badge === "bookings") return pendingBookings;
    return 0;
  }

  return (
    <div className="flex items-center justify-around py-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-ink-soft hover:text-brand transition-colors"
        >
          {item.iconHtml}
          <span className="text-[10px] font-medium">{item.label}</span>
          <NavBadge count={getBadgeCount(item.badge)} />
        </Link>
      ))}
      {profileSlot}
    </div>
  );
}
