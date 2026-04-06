"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { Eye } from "lucide-react";

type Props = {
  verificationId: string;
  userId: string;
  verificationType?: string;
  documentPath?: string | null;
};

export function AdminSitterActions({ verificationId, userId, verificationType, documentPath }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const es = locale === "es";

  async function handleViewDocument() {
    if (!documentPath) return;
    const supabase = createClient();

    // Try signed URL first (private bucket)
    const { data } = await supabase.storage
      .from("verification-docs")
      .createSignedUrl(documentPath, 300); // 5 min expiry

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      // Fallback: try as public URL (legacy uploads)
      const { data: pub } = supabase.storage
        .from("verification-docs")
        .getPublicUrl(documentPath);
      window.open(pub.publicUrl, "_blank");
    }
  }

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
      if (verificationType === "sitter_insurance") {
        await supabase
          .from("sitter_profiles")
          .update({
            has_insurance: true,
            insurance_verified_at: new Date().toISOString(),
          })
          .eq("id", userId);
      } else {
        await supabase
          .from("sitter_profiles")
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    }

    toast.success(approve
      ? (es ? "Verificación aprobada" : "Verification approved")
      : (es ? "Verificación rechazada" : "Verification rejected")
    );
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      {documentPath && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={handleViewDocument}
        >
          <Eye className="w-3.5 h-3.5" />
          {es ? "Ver" : "View"}
        </Button>
      )}
      <Button
        variant="primary"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(true)}
      >
        {es ? "Aprobar" : "Approve"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleAction(false)}
      >
        {es ? "Rechazar" : "Reject"}
      </Button>
    </div>
  );
}
