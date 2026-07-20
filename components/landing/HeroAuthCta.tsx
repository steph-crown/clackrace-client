"use client";

import { track } from "@/lib/analytics/track";
import { useSession } from "@/lib/auth/client";
import { ButtonLink } from "@/components/ui/ButtonLink";

function PlayNow() {
  return (
    <ButtonLink
      href="/play"
      size="lg"
      onClick={() => track("play_now_click")}
    >
      Play now
    </ButtonLink>
  );
}

export function HeroAuthCta() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <PlayNow />;
  }

  if (session?.user) {
    return (
      <>
        <PlayNow />
        <ButtonLink href="/stats" variant="ghost" size="lg">
          Your stats
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <PlayNow />
      <ButtonLink href="/signin" variant="ghost" size="lg">
        Sign in
      </ButtonLink>
    </>
  );
}
