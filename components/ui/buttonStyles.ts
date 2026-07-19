import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-cyan text-asphalt hover:scale-[1.02] active:scale-[0.98]",
  secondary: "border border-lane bg-transparent text-chalk hover:border-chalk/40",
  ghost: "border border-chalk/25 text-chalk hover:border-chalk/50 hover:bg-chalk/5",
  danger: "border border-danger/40 bg-transparent text-danger hover:border-danger/70",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-sm font-heading font-bold uppercase tracking-wider transition-[color,background-color,border-color,transform,opacity] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}
