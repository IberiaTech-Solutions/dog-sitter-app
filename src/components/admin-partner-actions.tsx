"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";

type Props = {
  partnerId: string;
  isVerified: boolean;
  adminId: string;
};

export function AdminPartnerActions({ partnerId, isVerified, adminId }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const es = locale === "es";

  async function handleAction(approve: boolean) {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("partner_profiles")
      .update({
        is_verified: approve,
        verified_at: approve ? new Date().toISOString() : null,
        verified_by: approve ? adminId : null,
      })
      .eq("id", partnerId);

    if (error) {
      toast.error(es ? "No se pudo actualizar" : "Could not update");
      setLoading(false);
      return;
    }

    toast.success(
      approve
        ? es
          ? "Partner aprobado"
          : "Partner approved"
        : es
          ? "Verificación revocada"
          : "Verification revoked"
    );
    router.refresh();
    setLoading(false);
  }

  if (isVerified) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(false)}
      >
        {es ? "Revocar" : "Revoke"}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(true)}
      >
        {es ? "Aprobar" : "Approve"}
      </Button>
    </div>
  );
}
