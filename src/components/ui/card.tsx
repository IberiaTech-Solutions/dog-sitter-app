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
      className={`rounded-2xl bg-surface border border-line ${paddings[padding]} ${
        hover
          ? "hover:border-ink-soft/30 hover:shadow-sm transition-all"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
