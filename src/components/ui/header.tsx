import { Link } from "@/i18n/navigation";

type HeaderProps = {
  appName: string;
  isLoggedIn?: boolean;
  children?: React.ReactNode;
};

export function Header({ appName, isLoggedIn, children }: HeaderProps) {
  const logoHref = isLoggedIn ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
        <Link href={logoHref} className="flex items-center gap-2.5">
          <img src="/icons/icon-192.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold text-stone-900 tracking-tight">
            {appName}
          </span>
        </Link>
        {children && (
          <nav className="flex items-center gap-2 sm:gap-3">
            {children}
          </nav>
        )}
      </div>
    </header>
  );
}
