import { Link } from "@/i18n/navigation";
import { Logo } from "../logo";

type HeaderProps = {
  appName: string;
  isLoggedIn?: boolean;
  children?: React.ReactNode;
};

export function Header({ appName, isLoggedIn, children }: HeaderProps) {
  const logoHref = isLoggedIn ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-line">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3 sm:px-8">
        <Link href={logoHref} className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-lg font-bold text-ink tracking-tight">
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
