"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
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
      color: "text-stone-400",
    },
    pending: {
      icon: Clock,
      label: es ? "Pendiente de envío" : "Pending submission",
      color: "text-amber-500",
    },
    submitted: {
      icon: Clock,
      label: es ? "En revisión" : "Under review",
      color: "text-blue-500",
    },
    approved: {
      icon: Check,
      label: es ? "Verificado" : "Verified",
      color: "text-green-600",
    },
    rejected: {
      icon: X,
      label: es ? "Rechazado" : "Rejected",
      color: "text-red-500",
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
        ? "Sube una foto de tu DNI o NIE para verificar tu identidad. Esto aumenta la confianza de los dueños."
        : "Upload a photo of your DNI or NIE to verify your identity. This builds trust with pet owners.");
  const uploadLabel = isInsurance
    ? (es ? "Subir póliza de seguro" : "Upload insurance policy")
    : (es ? "Subir DNI / NIE" : "Upload DNI / NIE");
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

    const { data: { publicUrl } } = supabase.storage
      .from("verification-docs")
      .getPublicUrl(upload.path);

    // Upsert verification record
    if (existing?.id) {
      await supabase
        .from("verifications")
        .update({
          document_url: publicUrl,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          notes: null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("verifications").insert({
        user_id: userId,
        type,
        document_url: publicUrl,
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
        <TitleIcon className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-stone-900">{title}</h3>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StatusIcon className={`w-4 h-4 ${current.color}`} />
        <span className={`text-sm font-medium ${current.color}`}>{current.label}</span>
      </div>

      {status === "approved" ? (
        <p className="text-sm text-green-700 bg-green-50 rounded-xl p-4">
          {approvedMsg}
        </p>
      ) : status === "submitted" ? (
        <p className="text-sm text-blue-700 bg-blue-50 rounded-xl p-4">
          {es
            ? "Tu documento está siendo revisado. Te notificaremos cuando se complete."
            : "Your document is being reviewed. We'll notify you when it's done."}
        </p>
      ) : (
        <>
          {status === "rejected" && existing?.notes && (
            <p className="text-sm text-red-700 bg-red-50 rounded-xl p-4 mb-4">
              {es ? "Motivo del rechazo: " : "Rejection reason: "}{existing.notes}
            </p>
          )}

          <p className="text-sm text-stone-500 mb-4">
            {description}
          </p>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Button variant="outline" size="md" disabled={uploading} className="pointer-events-none">
              <Upload className="w-4 h-4" />
              {uploading
                ? (es ? "Subiendo..." : "Uploading...")
                : uploadLabel}
            </Button>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <p className="mt-3 text-xs text-stone-400">
            {es
              ? "Formatos: imagen o PDF. Máximo 10MB. Tu documento se almacena de forma segura."
              : "Formats: image or PDF. Max 10MB. Your document is stored securely."}
          </p>
        </>
      )}
    </Card>
  );
}
