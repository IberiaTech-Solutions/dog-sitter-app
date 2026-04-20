"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";

const roles = [
  { value: "owner", labelEs: "Dueño", labelEn: "Owner", color: "border-line bg-line/40 text-ink" },
  { value: "sitter", labelEs: "Cuidador", labelEn: "Sitter", color: "border-brand bg-brand-soft text-brand-ink" },
  { value: "admin", labelEs: "Admin", labelEn: "Admin", color: "border-danger/70 bg-danger-soft text-danger" },
];

export function AdminInviteForm() {
  const locale = useLocale();
  const es = locale === "es";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("owner");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    setLoading(true);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        fullName: fullName.trim(),
        role,
      }),
    });

    if (res.ok) {
      toast.success(
        es ? `Invitación enviada a ${email}` : `Invitation sent to ${email}`
      );
      setEmail("");
      setFullName("");
      setRole("owner");
      setOpen(false);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || (es ? "Error al enviar" : "Failed to send"));
    }

    setLoading(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <UserPlus className="w-4 h-4" aria-hidden="true" />
        {es ? "Invitar usuario" : "Invite user"}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={es ? "Invitar usuario" : "Invite user"}
          className="absolute right-0 top-full mt-2 z-20 w-[min(92vw,22rem)] rounded-2xl bg-surface border border-line shadow-lg p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-ink">
              {es ? "Invitar usuario" : "Invite user"}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={es ? "Cerrar" : "Close"}
              className="text-ink-soft hover:text-ink transition-colors -mt-1 -mr-1 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                {es ? "Tipo de cuenta" : "Account type"}
              </label>
              <div className="flex gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    aria-pressed={role === r.value}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      role === r.value
                        ? r.color
                        : "border-line bg-surface text-ink-muted hover:border-ink-soft/40"
                    }`}
                  >
                    {es ? r.labelEs : r.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={es ? "Nombre completo" : "Full name"}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="María García"
            />

            <Input
              label={es ? "Correo electrónico" : "Email"}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@email.com"
            />

            <Button type="submit" disabled={loading} size="md" className="w-full">
              {loading
                ? (es ? "Enviando..." : "Sending...")
                : (es ? "Enviar invitación" : "Send invitation")}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
