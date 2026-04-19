import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const inputBase =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm placeholder:text-ink-soft focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all";

export function Input({ label, error, icon, className = "", id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`${inputBase} ${icon ? "pl-11" : ""} ${error ? "border-danger/70 focus:border-danger focus:ring-danger/25" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${inputBase} ${error ? "border-danger/70 focus:border-danger focus:ring-danger/25" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
