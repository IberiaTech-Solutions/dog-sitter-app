"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { Trash2, UserCog } from "lucide-react";

type Props = {
  userId: string;
  userName: string;
  currentRole: string;
};

export function AdminUserActions({ userId, userName, currentRole }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const es = locale === "es";

  const roles = [
    { value: "owner", label: es ? "Dueno" : "Owner" },
    { value: "sitter", label: es ? "Cuidador" : "Sitter" },
    { value: "admin", label: "Admin" },
  ];

  async function handleRoleChange(newRole: string) {
    if (newRole === currentRole) {
      setShowRoleMenu(false);
      return;
    }
    setLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) {
      toast.success(es ? `Rol cambiado a ${newRole}` : `Role changed to ${newRole}`);
      router.refresh();
    } else {
      toast.error(es ? "No se pudo cambiar el rol" : "Could not change role");
    }
    setLoading(false);
    setShowRoleMenu(false);
  }

  async function handleDelete() {
    setLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      toast.success(es ? "Usuario eliminado" : "User deleted");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || (es ? "No se pudo eliminar" : "Could not delete"));
    }
    setLoading(false);
    setShowConfirm(false);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Role change */}
      <div className="relative">
        <button
          onClick={() => { setShowRoleMenu(!showRoleMenu); setShowConfirm(false); }}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <UserCog className="w-3.5 h-3.5" />
          {es ? "Rol" : "Role"}
        </button>
        {showRoleMenu && (
          <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[120px]">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                disabled={loading}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                  role.value === currentRole
                    ? "font-semibold text-green-600"
                    : "text-stone-700"
                }`}
              >
                {role.label}
                {role.value === currentRole && " ✓"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      {!showConfirm ? (
        <button
          onClick={() => { setShowConfirm(true); setShowRoleMenu(false); }}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600">
            {es ? `Eliminar ${userName}?` : `Delete ${userName}?`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={handleDelete}
            className="!text-red-600 !text-xs"
          >
            {es ? "Si" : "Yes"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => setShowConfirm(false)}
            className="!text-xs"
          >
            No
          </Button>
        </div>
      )}
    </div>
  );
}
