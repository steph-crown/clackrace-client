"use client";

import { useSession } from "@/lib/auth/client";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function HeroAuthCta() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <ButtonLink href="/play" size="lg">
        Play now
      </ButtonLink>
    );
  }

  if (session?.user) {
    return (
      <>
        <ButtonLink href="/play" size="lg">
          Play now
        </ButtonLink>
        <ButtonLink href="/stats" variant="ghost" size="lg">
          Your stats
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <ButtonLink href="/play" size="lg">
        Play now
      </ButtonLink>
      <ButtonLink href="/signin" variant="ghost" size="lg">
        Sign in
      </ButtonLink>
    </>
  );
}
