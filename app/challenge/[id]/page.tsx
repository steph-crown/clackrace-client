"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchChallenge, respondChallenge } from "@/lib/api/clack";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

/** Deep link from email invite. */
export default function ChallengeInvitePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace(`/signin?next=/challenge/${params.id}`);
      return;
    }
    if (!session?.user) return;
    void fetchChallenge(params.id).then((res) => {
      if (!res.ok) {
        setError("Invite not found or expired.");
        return;
      }
      setName(res.data.challenge.requesterUsername);
      if (res.data.challenge.status !== "pending") {
        setError("This invite is no longer available.");
      }
    });
  }, [session, isPending, params.id, router]);

  const respond = async (accept: boolean) => {
    setBusy(true);
    const res = await respondChallenge(params.id, accept);
    setBusy(false);
    if (!accept) {
      router.push("/play");
      return;
    }
    if (res.ok && res.data.sessionId) {
      router.push(`/play/${res.data.sessionId}`);
      return;
    }
    setError(res.ok ? "Could not open race" : res.error.message);
  };

  return (
    <PageShell centered logoHref="/play">
      <Eyebrow>Challenge invite</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
        {name ? `${name} challenged you` : "Direct Challenge"}
      </h1>
      {error ? (
        <>
          <p className="mt-3 text-sm text-magenta">{error}</p>
          <div className="mt-8 flex gap-3">
            <ButtonLink href="/play">All races</ButtonLink>
            <ButtonLink href="/play/solo" variant="secondary">
              Race CPU
            </ButtonLink>
          </div>
        </>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void respond(true)}
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void respond(false)}
          >
            Decline
          </Button>
        </div>
      )}
    </PageShell>
  );
}
