type SemanticVariant = "brand" | "warning" | "danger" | "neutral";
type LegacyVariant = "green" | "amber" | "red" | "blue" | "purple" | "stone";
type Variant = SemanticVariant | LegacyVariant;

type BadgeProps = {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
};

const variants: Record<Variant, string> = {
  brand: "bg-brand-soft text-brand-ink",
  warning: "bg-warning/15 text-warning-ink",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-line/50 text-ink-muted",
  // Legacy names — kept so existing callers still compile. Map to the 4 semantic slots.
  green: "bg-brand-soft text-brand-ink",
  amber: "bg-warning/15 text-warning-ink",
  red: "bg-danger-soft text-danger",
  blue: "bg-line/50 text-ink-muted",
  purple: "bg-line/50 text-ink-muted",
  stone: "bg-line/50 text-ink-muted",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
