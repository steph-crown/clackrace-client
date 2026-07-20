import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type RaceChromeMenuLinkProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onNavigate: () => void;
};

export function RaceChromeMenuLink({
  href,
  children,
  active,
  onNavigate,
}: RaceChromeMenuLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "block rounded-sm px-3 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-colors",
        active
          ? "bg-cyan/10 text-cyan"
          : "text-chalk hover:bg-chalk/5",
      )}
    >
      {children}
    </Link>
  );
}
