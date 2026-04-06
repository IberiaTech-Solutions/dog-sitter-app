"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";

type Props = {
  verificationId: string;
  userId: string;
};

export function AdminSitterActions({ verificationId, userId }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const es = locale === "es";

  async function handleAction(approve: boolean) {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("verifications")
      .update({
        status: approve ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    if (approve) {
      await supabase
        .from("sitter_profiles")
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(true)}
      >
        ✅ {es ? "Aprobar" : "Approve"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(false)}
      >
        ❌ {es ? "Rechazar" : "Reject"}
      </Button>
    </div>
  );
}
