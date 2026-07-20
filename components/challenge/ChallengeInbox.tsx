"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  notificationsStreamUrl,
  respondChallenge,
  type ChallengeRecord,
} from "@/lib/api/clack";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

type InviteEvent = {
  type: string;
  challenge: ChallengeRecord;
  sessionId?: string;
};

/** SSE-driven challenge modal — does not auto-dismiss (PRD §6.4). */
export function ChallengeInbox() {
  const { data: session } = useSession();
  const router = useRouter();
  const [invite, setInvite] = useState<ChallengeRecord | null>(null);
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const inviteIdRef = useRef<string | null>(null);

  useEffect(() => {
    inviteIdRef.current = invite?.id ?? null;
  }, [invite]);

  useEffect(() => {
    if (!session?.user) return;

    const es = new EventSource(notificationsStreamUrl(), {
      withCredentials: true,
    });

    const onChallenge = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as InviteEvent;
        const uid = session.user.id;

        if (data.type === "invite" && data.challenge.status === "pending") {
          if (data.challenge.recipientId === uid) {
            setInvite(data.challenge);
            setExpired(false);
          }
          return;
        }

        if (
          data.type === "expired" ||
          data.type === "revoked" ||
          data.type === "declined"
        ) {
          const matchesOpen =
            inviteIdRef.current === data.challenge.id ||
            data.challenge.recipientId === uid;
          if (matchesOpen) {
            setInvite(null);
            setExpired(data.type === "expired");
          }
          return;
        }

        if (data.type === "accepted" && data.sessionId) {
          if (
            data.challenge.requesterId === uid ||
            data.challenge.recipientId === uid
          ) {
            setInvite(null);
            setExpired(false);
            router.push(`/play/${data.sessionId}`);
          }
        }
      } catch {
        /* ignore malformed */
      }
    };

    es.addEventListener("challenge", onChallenge as EventListener);
    return () => {
      es.removeEventListener("challenge", onChallenge as EventListener);
      es.close();
    };
  }, [session?.user?.id, session?.user, router]);

  if (!session?.user || (!invite && !expired)) return null;

  const respond = async (accept: boolean) => {
    if (!invite) return;
    setBusy(true);
    const res = await respondChallenge(invite.id, accept);
    setBusy(false);
    if (!accept) {
      setInvite(null);
      setExpired(false);
      return;
    }
    if (res.ok && res.data.sessionId) {
      setInvite(null);
      router.push(`/play/${res.data.sessionId}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-asphalt/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-invite-title"
    >
      <div className="w-full max-w-md rounded-sm border border-lane bg-asphalt-raised p-6 shadow-xl">
        {expired && !invite ? (
          <>
            <h2
              id="challenge-invite-title"
              className="font-heading text-xl font-bold uppercase text-chalk"
            >
              This invite has expired
            </h2>
            <p className="mt-2 text-sm text-chalk-muted">
              Head back to race select or race the CPU while you wait.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/play">All races</ButtonLink>
              <ButtonLink href="/play/solo" variant="secondary">
                Race CPU
              </ButtonLink>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setExpired(false)}
              >
                Dismiss
              </Button>
            </div>
          </>
        ) : invite ? (
          <>
            <h2
              id="challenge-invite-title"
              className="font-heading text-xl font-bold uppercase text-chalk"
            >
              Challenge from {invite.requesterUsername}
            </h2>
            <p className="mt-2 text-sm text-chalk-muted">
              Direct race — accept to jump into a private Race Session.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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
          </>
        ) : null}
      </div>
    </div>
  );
}
