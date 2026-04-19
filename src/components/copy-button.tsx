"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  value: string;
  labelCopy?: string;
  labelCopied?: string;
  className?: string;
};

export function CopyButton({
  value,
  labelCopy = "Copy",
  labelCopied = "Copied",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API denied (e.g., insecure context). Silently fail — users can still select manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={labelCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-ink-muted hover:text-ink hover:bg-canvas transition-colors ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{copied ? labelCopied : labelCopy}</span>
    </button>
  );
}
