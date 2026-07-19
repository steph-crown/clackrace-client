"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createChallenge,
  revokeChallenge,
  type ChallengeRecord,
} from "@/lib/api/clack";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";

export default function ChallengePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [pending, setPending] = useState<ChallengeRecord | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!pending || pending.status !== "pending") return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((pending.expiresAt - Date.now()) / 1000),
      );
      setSecondsLeft(left);
      if (left <= 0) {
        setPending((p) => (p ? { ...p, status: "expired" } : p));
      }
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [pending]);

  // Listen for accept via SSE redirect is handled in ChallengeInbox;
  // also poll-ish via EventSource for requester navigation.
  useEffect(() => {
    if (!session?.user || !pending) return;
    const es = new EventSource("/api/clack/notifications/stream", {
      withCredentials: true,
    });
    const onChallenge = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as {
          type: string;
          challenge: ChallengeRecord;
          sessionId?: string;
        };
        if (
          data.challenge.id === pending.id &&
          data.type === "accepted" &&
          data.sessionId
        ) {
          router.push(`/play/${data.sessionId}`);
        }
        if (
          data.challenge.id === pending.id &&
          (data.type === "declined" || data.type === "expired")
        ) {
          setPending({ ...data.challenge, status: data.type });
        }
      } catch {
        /* ignore */
      }
    };
    es.addEventListener("challenge", onChallenge as EventListener);
    return () => {
      es.removeEventListener("challenge", onChallenge as EventListener);
      es.close();
    };
  }, [session?.user, pending?.id, router, pending]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNote(null);
    const res = await createChallenge(target.trim());
    setBusy(false);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    setPending(res.data.challenge);
    if (!res.data.challenge.recipientId) {
      setNote(
        res.data.emailDelivery === "sent"
          ? "Invite sent — they'll need to sign up to race."
          : "Invite queued — check server logs for the signup link (dev).",
      );
    } else if (res.data.emailDelivery === "logged") {
      setNote("They're offline — invite URL logged on the server (dev).");
    } else if (res.data.emailDelivery === "sent") {
      setNote("Invite email sent.");
    } else if (res.data.emailDelivery === "rate_limited") {
      setNote("Too many invites sent. Try again later.");
    }
  };

  if (isPending || !session?.user) {
    return (
      <PageShell centered>
        <p className="text-chalk-muted">Loading…</p>
      </PageShell>
    );
  }

  if (pending?.status === "expired") {
    return (
      <PageShell
        centered
        logoHref="/play"
        headerRight={<RaceChrome currentMode="challenge" />}
      >
        <Eyebrow>Timed out</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
          They weren&apos;t able to join
        </h1>
        <p className="mt-2 text-sm text-chalk-muted">
          Try again, or Race CPU while you wait.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setPending(null);
              setTarget("");
            }}
          >
            Try again
          </Button>
          <ButtonLink href="/play/solo" variant="secondary">
            Race CPU
          </ButtonLink>
          <ButtonLink href="/play" variant="ghost">
            Modes
          </ButtonLink>
        </div>
      </PageShell>
    );
  }

  if (pending?.status === "pending") {
    return (
      <PageShell
        centered
        logoHref="/play"
        headerRight={<RaceChrome currentMode="challenge" />}
      >
        <Eyebrow>Challenge sent</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
          Waiting…
        </h1>
        <p className="mt-2 font-mono text-4xl text-cyan">{secondsLeft}s</p>
        <p className="mt-2 text-sm text-chalk-muted">
          {pending.delivery === "online"
            ? "They’re in the app — 60s to respond."
            : "Offline invite — up to ~15 minutes."}
        </p>
        {note ? <p className="mt-3 text-sm text-chalk-muted">{note}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await revokeChallenge(pending.id);
              setPending(null);
            }}
          >
            Revoke
          </Button>
          <ButtonLink href="/play/solo" variant="ghost">
            Race CPU instead
          </ButtonLink>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      centered
      logoHref="/play"
      headerRight={<RaceChrome currentMode="challenge" />}
    >
      <Eyebrow>Direct Challenge</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
        Challenge a Friend
      </h1>
      <p className="mt-2 max-w-md text-sm text-chalk-muted">
        Enter their username or email. Both of you must be signed in.
      </p>

      <form onSubmit={send} className="mt-8 w-full max-w-md space-y-4">
        <label className="block">
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            Username or email
          </span>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            className="mt-1.5 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2.5 font-mono text-sm text-chalk outline-none focus:border-cyan"
            placeholder="turbo or friend@email.com"
          />
        </label>
        {error ? (
          <p className="text-sm text-magenta" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy} fullWidth>
          {busy ? "Sending…" : "Send challenge"}
        </Button>
      </form>
    </PageShell>
  );
}
