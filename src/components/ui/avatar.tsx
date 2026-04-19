type Size = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
};

const sizeStyles: Record<Size, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeStyles[size]} rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} shrink-0 rounded-2xl bg-gradient-to-br from-brand to-brand-ink flex items-center justify-center text-white font-bold shadow-sm shadow-brand/20 ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
