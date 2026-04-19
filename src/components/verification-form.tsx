"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { Shield, Upload, Clock, Check, X } from "lucide-react";
import { toast } from "sonner";

type Verification = {
  id: string;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  notes: string | null;
} | null;

type VerificationType = "dni_nie" | "sitter_insurance";

export function VerificationForm({ userId, existing, type = "dni_nie" }: { userId: string; existing: Verification; type?: VerificationType }) {
  const locale = useLocale();
  const es = locale === "es";
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(existing?.status ?? "none");

  const statusDisplay: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    none: {
      icon: Upload,
      label: es ? "No verificado" : "Not verified",
      color: "text-ink-soft",
    },
    pending: {
      icon: Clock,
      label: es ? "Pendiente de envío" : "Pending submission",
      color: "text-warning",
    },
    submitted: {
      icon: Clock,
      label: es ? "En revisión" : "Under review",
      color: "text-ink-muted",
    },
    approved: {
      icon: Check,
      label: es ? "Verificado" : "Verified",
      color: "text-brand",
    },
    rejected: {
      icon: X,
      label: es ? "Rechazado" : "Rejected",
      color: "text-danger",
    },
  };

  const current = statusDisplay[status] ?? statusDisplay.none;
  const StatusIcon = current.icon;

  const isInsurance = type === "sitter_insurance";
  const title = isInsurance
    ? (es ? "Seguro de responsabilidad civil" : "Liability insurance")
    : (es ? "Verificación de identidad" : "Identity verification");
  const description = isInsurance
    ? (es
        ? "Sube tu póliza de seguro de responsabilidad civil (RC profesional). Es obligatorio para recibir reservas."
        : "Upload your liability insurance policy (professional RC). Required to receive bookings.")
    : (es
        ? "Sube una foto de tu DNI, NIE o pasaporte para verificar tu identidad. Esto aumenta la confianza de los dueños."
        : "Upload a photo of your DNI, NIE, or passport to verify your identity. This builds trust with pet owners.");
  const uploadLabel = isInsurance
    ? (es ? "Subir póliza de seguro" : "Upload insurance policy")
    : (es ? "Subir DNI / NIE / Pasaporte" : "Upload DNI / NIE / Passport");
  const approvedMsg = isInsurance
    ? (es
        ? "Tu seguro ha sido verificado. Los dueños verán el badge de asegurado en tu perfil."
        : "Your insurance is verified. Owners will see the insured badge on your profile.")
    : (es
        ? "Tu identidad ha sido verificada. Los dueños verán el badge de verificado en tu perfil."
        : "Your identity is verified. Owners will see the verified badge on your profile.");
  const TitleIcon = isInsurance ? Shield : Shield;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(es ? "El archivo es demasiado grande (máx 10MB)" : "File too large (max 10MB)");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `verifications/${userId}/${Date.now()}-${safeName}`;

    const { data: upload, error: uploadError } = await supabase.storage
      .from("verification-docs")
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      toast.error(es ? "Error al subir el documento" : "Upload failed");
      setUploading(false);
      e.target.value = "";
      return;
    }

    // Store the path, not a public URL — documents should be private
    const documentPath = upload.path;

    // Upsert verification record
    if (existing?.id) {
      await supabase
        .from("verifications")
        .update({
          document_url: documentPath,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          notes: null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("verifications").insert({
        user_id: userId,
        type,
        document_url: documentPath,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });
    }

    setStatus("submitted");
    toast.success(es ? "Documento enviado para revisión" : "Document submitted for review");
    setUploading(false);
    e.target.value = "";
  }

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <TitleIcon className="w-5 h-5 text-brand" />
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StatusIcon className={`w-4 h-4 ${current.color}`} />
        <span className={`text-sm font-medium ${current.color}`}>{current.label}</span>
      </div>

      {status === "approved" ? (
        <p className="text-sm text-brand-ink bg-brand-soft rounded-xl p-4">
          {approvedMsg}
        </p>
      ) : status === "submitted" ? (
        <p className="text-sm text-ink bg-line/40 rounded-xl p-4">
          {es
            ? "Tu documento está siendo revisado. Te notificaremos cuando se complete."
            : "Your document is being reviewed. We'll notify you when it's done."}
        </p>
      ) : (
        <>
          {status === "rejected" && existing?.notes && (
            <p className="text-sm text-danger bg-danger-soft rounded-xl p-4 mb-4">
              {es ? "Motivo del rechazo: " : "Rejection reason: "}{existing.notes}
            </p>
          )}

          <p className="text-sm text-ink-muted mb-4">
            {description}
          </p>

          <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border-2 border-brand text-brand hover:bg-brand-soft px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">
            <Upload className="w-4 h-4" />
            {uploading
              ? (es ? "Subiendo..." : "Uploading...")
              : uploadLabel}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.pdf"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <p className="mt-3 text-xs text-ink-soft">
            {es
              ? "Formatos: imagen o PDF. Máximo 10MB. Tu documento se almacena de forma segura."
              : "Formats: image or PDF. Max 10MB. Your document is stored securely."}
          </p>
        </>
      )}
    </Card>
  );
}
