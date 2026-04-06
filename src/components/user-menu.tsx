"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui";

type Props = {
  userName: string;
  avatarUrl?: string | null;
  locale: string;
};

export function UserMenu({ userName, avatarUrl, locale }: Props) {
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
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-lg shadow-stone-200/50 overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-semibold text-stone-900 truncate">{userName}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <User className="w-4 h-4 text-stone-400" />
              {es ? "Mi perfil" : "My profile"}
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-stone-100 py-1">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
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
