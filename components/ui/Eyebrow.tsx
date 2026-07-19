import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan",
        className,
      )}
    >
      {children}
    </p>
  );
}
