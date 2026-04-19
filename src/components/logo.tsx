type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function Logo({ size = 32, className, title }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      className={className ?? "text-brand"}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="50" cy="70" rx="20" ry="14" />
      <ellipse
        cx="26"
        cy="40"
        rx="6"
        ry="9"
        transform="rotate(-15 26 40)"
      />
      <ellipse
        cx="42"
        cy="28"
        rx="7"
        ry="9.5"
        transform="rotate(-5 42 28)"
      />
      <ellipse
        cx="58"
        cy="28"
        rx="7"
        ry="9.5"
        transform="rotate(5 58 28)"
      />
      <ellipse
        cx="74"
        cy="40"
        rx="6"
        ry="9"
        transform="rotate(15 74 40)"
      />
    </svg>
  );
}
