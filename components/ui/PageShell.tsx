import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "./Logo";

type PageShellProps = {
  children: ReactNode;
  /** Center content in a max-width column (mode select, lobby, setup). */
  centered?: boolean;
  className?: string;
  contentClassName?: string;
  logoHref?: string;
  headerRight?: ReactNode;
};

/** Shared asphalt page chrome — logo top-left, consistent with other app screens. */
export function PageShell({
  children,
  centered = false,
  className,
  contentClassName,
  logoHref = "/",
  headerRight,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Logo href={logoHref} size="md" />
        {headerRight}
      </div>
      <div
        className={cn(
          centered
            ? "mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 sm:py-16"
            : "flex-1",
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}
