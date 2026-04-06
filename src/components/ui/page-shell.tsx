type PageShellProps = {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const maxWidths = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function PageShell({ children, maxWidth = "xl" }: PageShellProps) {
  return (
    <main className={`mx-auto ${maxWidths[maxWidth]} px-5 py-8 sm:px-8`}>
      {children}
    </main>
  );
}
