import { Link } from "@/i18n/navigation";
import { PawPrint } from "lucide-react";

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
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <PawPrint className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
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
