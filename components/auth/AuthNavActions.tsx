"use client";

import { useSession } from "@/lib/auth/client";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Sign in / account controls that respect session state. */
export function AuthNavActions({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <span className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
        …
      </span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/stats" variant="ghost" size={size}>
          Stats
        </ButtonLink>
        <ButtonLink href="/settings" variant="ghost" size={size}>
          Settings
        </ButtonLink>
      </div>
    );
  }

  return (
    <ButtonLink href="/signin" variant="ghost" size={size}>
      Sign in
    </ButtonLink>
  );
}
