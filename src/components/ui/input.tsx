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
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm placeholder:text-stone-400 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all";

export function Input({ label, error, icon, className = "", id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`${inputBase} ${icon ? "pl-11" : ""} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${inputBase} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
