"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui";
import {
  Camera,
  MapPin,
  Phone,
  Dog,
  Shield,
  Settings,
  FileText,
  ChevronRight,
  Check,
  Clock,
} from "lucide-react";

type StepStatus = "done" | "in_review" | "pending";

type Step = {
  key: string;
  icon: typeof Camera;
  labelEs: string;
  labelEn: string;
  href: string;
  status: StepStatus;
  roles: string[];
};

type Props = {
  profile: {
    avatar_url: string | null;
    city: string | null;
    phone: string | null;
    bio: string | null;
    role: string;
  };
  hasPets: boolean;
  hasSitterProfile: boolean;
  isVerified: boolean | "in_review";
  hasInsurance: boolean | "in_review";
};

function getStatus(value: boolean | "in_review"): StepStatus {
  if (value === "in_review") return "in_review";
  return value ? "done" : "pending";
}

export function ProfileCompletion({
  profile,
  hasPets,
  hasSitterProfile,
  isVerified,
  hasInsurance,
}: Props) {
  const locale = useLocale();
  const es = locale === "es";
  const role = profile.role;

  const steps: Step[] = [
    {
      key: "photo",
      icon: Camera,
      labelEs: "Sube una foto de perfil",
      labelEn: "Add a profile photo",
      href: "/dashboard/profile",
      status: profile.avatar_url ? "done" : "pending",
      roles: ["owner", "sitter", "both"],
    },
    {
      key: "city",
      icon: MapPin,
      labelEs: "Indica tu ciudad",
      labelEn: "Add your city",
      href: "/dashboard/profile",
      status: profile.city ? "done" : "pending",
      roles: ["owner", "sitter", "both"],
    },
    {
      key: "phone",
      icon: Phone,
      labelEs: "Añade tu teléfono",
      labelEn: "Add your phone number",
      href: "/dashboard/profile",
      status: profile.phone ? "done" : "pending",
      roles: ["owner", "sitter", "both"],
    },
    {
      key: "pet",
      icon: Dog,
      labelEs: "Registra tu primera mascota",
      labelEn: "Add your first pet",
      href: "/dashboard/pets/new",
      status: hasPets ? "done" : "pending",
      roles: ["owner", "both"],
    },
    {
      key: "sitter",
      icon: Settings,
      labelEs: "Configura tu perfil de cuidador",
      labelEn: "Set up your sitter profile",
      href: "/dashboard/sitter-setup",
      status: hasSitterProfile ? "done" : "pending",
      roles: ["sitter", "both"],
    },
    {
      key: "dni",
      icon: Shield,
      labelEs: "Verifica tu identidad (DNI/NIE)",
      labelEn: "Verify your identity (DNI/NIE)",
      href: "/dashboard/sitter-setup",
      status: getStatus(isVerified),
      roles: ["sitter", "both"],
    },
    {
      key: "insurance",
      icon: FileText,
      labelEs: "Sube tu seguro de responsabilidad civil",
      labelEn: "Upload your liability insurance",
      href: "/dashboard/sitter-setup",
      status: getStatus(hasInsurance),
      roles: ["sitter", "both"],
    },
  ];

  const relevant = steps.filter((s) => s.roles.includes(role));
  const completed = relevant.filter((s) => s.status === "done").length;
  const inReview = relevant.filter((s) => s.status === "in_review").length;
  const total = relevant.length;
  const percent = total > 0 ? Math.round(((completed + inReview) / total) * 100) : 100;

  // Don't show if everything is fully done
  if (completed >= total) return null;

  const pending = relevant.filter((s) => s.status === "pending");
  const reviewing = relevant.filter((s) => s.status === "in_review");
  const done = relevant.filter((s) => s.status === "done");

  return (
    <Card padding="lg" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-ink">
            {es ? "Completa tu perfil" : "Complete your profile"}
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            {completed + inReview}/{total} {es ? "completado" : "completed"}
          </p>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" style={{ stroke: "var(--color-line)" }} strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              style={{ stroke: "var(--color-brand)" }} strokeWidth="3"
              strokeDasharray={`${percent * 0.942} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-line rounded-full mb-5">
        <div
          className="h-1.5 bg-brand rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* In review steps */}
      {reviewing.length > 0 && (
        <div className="space-y-1 mb-3">
          {reviewing.map((step) => (
            <div
              key={step.key}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-warning/10"
            >
              <Clock className="w-5 h-5 text-warning-ink shrink-0" aria-hidden="true" />
              <span className="text-sm text-ink flex-1">
                {es ? step.labelEs : step.labelEn}
              </span>
              <span className="text-xs font-medium text-warning-ink">
                {es ? "En revisión" : "Under review"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pending steps */}
      {pending.length > 0 && (
        <div className="space-y-1">
          {pending.map((step) => (
            <Link
              key={step.key}
              href={step.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-canvas transition-colors group"
            >
              <step.icon className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />
              <span className="text-sm text-ink flex-1">
                {es ? step.labelEs : step.labelEn}
              </span>
              <ChevronRight
                className="w-4 h-4 text-ink-soft group-hover:text-ink transition-colors"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}

      {/* Completed steps */}
      {done.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line">
          <div className="flex flex-wrap gap-2">
            {done.map((step) => (
              <span key={step.key} className="flex items-center gap-1 text-xs text-brand-ink bg-brand-soft px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3" />
                {es ? step.labelEs.split(" ").slice(0, 3).join(" ") : step.labelEn.split(" ").slice(0, 3).join(" ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
