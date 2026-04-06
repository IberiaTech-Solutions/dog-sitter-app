import { type ButtonHTMLAttributes } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = BaseProps & { href: string; children: React.ReactNode };

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-600/20",
  secondary:
    "bg-stone-900 text-white hover:bg-stone-800 shadow-sm",
  outline:
    "border-2 border-green-600 text-green-600 hover:bg-green-50",
  ghost:
    "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-sm",
};

function getStyles(variant: Variant = "primary", size: Size = "md", className = "") {
  return `inline-flex items-center justify-center gap-2 font-semibold rounded-xl active:scale-[0.98] disabled:opacity-50 transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={getStyles(variant, size, className)} {...props} />
  );
}

export function LinkButton({ variant, size, className, href, children }: LinkButtonProps) {
  return (
    <Link href={href} className={getStyles(variant, size, className)}>
      {children}
    </Link>
  );
}
