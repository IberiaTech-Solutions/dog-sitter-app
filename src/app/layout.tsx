import type { ReactNode } from "react";

// Root layout is minimal — the [locale] layout handles everything.
// This exists because Next.js requires a root layout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
