import { type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

const selectBase =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all";

export function Select({ label, error, id, className = "", children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${selectBase} ${error ? "border-danger/70 focus:border-danger focus:ring-danger/25" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
