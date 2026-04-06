import { type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
};

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ hover, padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-stone-100 ${paddings[padding]} ${
        hover
          ? "hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all"
          : "shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
