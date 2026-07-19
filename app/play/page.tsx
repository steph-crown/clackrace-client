"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ModeCard } from "@/components/ui/ModeCard";
import { PageShell } from "@/components/ui/PageShell";
import { createPublicSession } from "@/lib/api/client";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

export default function ModeSelectPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const startPublic = async () => {
    setCreating(true);
    const session = await createPublicSession(getOrCreateGuestSessionToken());
    if (!session) {
      setCreating(false);
      router.push("/play/public");
      return;
    }
    router.push(`/play/${session.id}`);
  };

  return (
    <PageShell centered logoHref="/">
      <Eyebrow>Select mode</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        How do you want to race?
      </h1>

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
          <ModeCard
            title="Challenge a Friend"
            description="Signed-in direct race."
            disabled
          />
        </li>
      </ul>
    </PageShell>
  );
}
