import Image from "next/image";

type Size = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
};

const sizePx: Record<Size, number> = { sm: 32, md: 44, lg: 56, xl: 80 };

const sizeStyles: Record<Size, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const px = sizePx[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`${sizeStyles[size]} rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} shrink-0 rounded-2xl bg-brand flex items-center justify-center text-surface font-bold ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
