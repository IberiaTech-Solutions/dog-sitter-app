import { PublicHeader, PublicFooter } from "@/components/ui";

type Props = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  draftLabel: string;
  children: React.ReactNode;
};

export function LegalArticle({ eyebrow, title, lastUpdated, draftLabel, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <PublicHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">
            {eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-display text-ink font-semibold">
            {title}
          </h1>
          <p className="mt-6 text-sm text-ink-soft">
            {lastUpdated} · <span className="text-warning-ink font-medium">{draftLabel}</span>
          </p>

          <article className="mt-12 space-y-8 text-base text-ink-muted leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:max-w-prose [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:max-w-prose [&_a]:text-brand [&_a]:hover:text-brand-ink [&_a]:transition-colors [&_a]:font-medium">
            {children}
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
