"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Card, Input, Button } from "@/components/ui";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const roles = [
  { value: "owner", labelEs: "Dueño", labelEn: "Owner", color: "border-blue-500 bg-blue-50 text-blue-700" },
  { value: "sitter", labelEs: "Cuidador", labelEn: "Sitter", color: "border-green-500 bg-green-50 text-green-700" },
  { value: "admin", labelEs: "Admin", labelEn: "Admin", color: "border-red-500 bg-red-50 text-red-700" },
];

export function AdminInviteForm() {
  const locale = useLocale();
  const es = locale === "es";
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("owner");
  const [loading, setLoading] = useState(false);

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
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || (es ? "Error al enviar" : "Failed to send"));
    }

    setLoading(false);
  }

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-stone-900">
          {es ? "Invitar usuario" : "Invite user"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selection */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {es ? "Tipo de cuenta" : "Account type"}
          </label>
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  role === r.value
                    ? r.color
                    : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
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
    </Card>
  );
}
