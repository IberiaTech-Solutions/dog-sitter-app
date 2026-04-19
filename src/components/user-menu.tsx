"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

type Props = {
  userName: string;
  avatarUrl?: string | null;
  locale: string;
  userRole?: string;
};

const roleBadge: Record<string, { label: { es: string; en: string }; color: string }> = {
  owner: { label: { es: "Dueño", en: "Owner" }, color: "bg-line/50 text-ink" },
  sitter: { label: { es: "Cuidador", en: "Sitter" }, color: "bg-brand-soft text-brand-ink" },
  both: { label: { es: "Dueño y cuidador", en: "Owner & Sitter" }, color: "bg-line/50 text-ink-muted" },
  admin: { label: { es: "Admin", en: "Admin" }, color: "bg-danger-soft text-danger" },
};

export function UserMenu({ userName, avatarUrl, locale, userRole }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const es = locale === "es";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-stone-200 transition-all"
      >
        <Avatar name={userName} src={avatarUrl} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-line shadow-md overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold text-ink truncate">{userName}</p>
            {userRole && roleBadge[userRole] && (
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge[userRole].color}`}>
                {es ? roleBadge[userRole].label.es : roleBadge[userRole].label.en}
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-muted hover:bg-stone-50 transition-colors"
            >
              <User className="w-4 h-4 text-ink-soft" />
              {es ? "Mi perfil" : "My profile"}
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-line py-1">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                {es ? "Cerrar sesión" : "Log out"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
