type ClassValue = string | false | null | undefined;

/** Tiny className joiner — no extra dependency. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
