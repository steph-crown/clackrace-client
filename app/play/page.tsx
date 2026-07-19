"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/auth/client";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ModeCard } from "@/components/ui/ModeCard";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { createPublicSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function ModeSelectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [creating, setCreating] = useState(false);
  const signedIn = !!session?.user;

  const startPublic = async () => {
    setCreating(true);
    const created = await createPublicSession(getOrCreateGuestSessionToken());
    if (!created) {
      setCreating(false);
      router.push("/play/public");
      return;
    }
    router.push(`/play/${created.id}`);
  };

  return (
    <PageShell centered logoHref="/" headerRight={<RaceChrome />}>
      <Eyebrow>Select mode</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        How do you want to race?
      </h1>
      {signedIn ? (
        <p className="mt-2 text-sm text-chalk-muted">
          Signed in as{" "}
          <span className="text-cyan">
            {(session.user as { username?: string }).username ??
              session.user.name}
          </span>
          {" · "}
          <ButtonLink href="/settings" variant="ghost" size="sm">
            Settings
          </ButtonLink>
        </p>
      ) : (
        <p className="mt-2 text-sm text-chalk-muted">
          Racing as guest.{" "}
          <a href="/signin" className="text-cyan underline-offset-2 hover:underline">
            Sign in
          </a>{" "}
          for streaks, boards, and Challenge.
        </p>
      )}

      <ul className="mt-12 grid gap-4">
        <li>
          <ModeCard
            href="/play/solo"
            title="Race CPU"
            description="Solo practice. Instant start."
            accent="cyan"
          />
        </li>
        <li>
          <ModeCard
            title="Public Multiplayer"
            description="Share a link. Anyone can join."
            accent="magenta"
            busy={creating}
            onClick={() => void startPublic()}
          />
        </li>
        <li>
          {signedIn ? (
            <ModeCard
              href="/challenge"
              title="Challenge a Friend"
              description="Signed-in direct race."
              accent="signal"
            />
          ) : (
            <ModeCard
              title="Challenge a Friend"
              description="Sign in required for both players."
              disabled
            />
          )}
        </li>
      </ul>
    </PageShell>
  );
}
