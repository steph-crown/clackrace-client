import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-5xl sm:text-7xl md:text-8xl",
} as const;

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  const classes = cn(
    "font-logo tracking-wide text-chalk",
    sizeClass[size],
    className,
  );

  if (!href) {
    return (
      <span className={classes}>
        Clack<span className="text-cyan">Race</span>
      </span>
    );
  }

  return (
    <Link href={href} className={classes}>
      Clack<span className="text-cyan">Race</span>
    </Link>
  );
}
