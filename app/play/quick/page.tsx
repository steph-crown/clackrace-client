"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  cancelMatchmaking,
  enqueueMatchmaking,
  pollMatchmaking,
} from "@/lib/api/clack";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { getOrCreateGuestSessionToken } from "@/lib/guest-token";

type Phase = "searching" | "timeout" | "error";

export default function QuickRaceSearchPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("searching");
  const [message, setMessage] = useState("Looking for racers…");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const ticketRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;
    let tickTimer: number | undefined;

    const run = async () => {
      const res = await enqueueMatchmaking(getOrCreateGuestSessionToken());
      if (cancelled) return;
      if (!res.ok) {
        setPhase("error");
        setMessage(res.error.message);
        return;
      }
      ticketRef.current = res.data.ticketId;
      if (res.data.status === "assigned" && res.data.sessionId) {
        router.replace(`/play/${res.data.sessionId}`);
        return;
      }

      const expiresAt = res.data.expiresAt;
      tickTimer = window.setInterval(() => {
        const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        setSecondsLeft(left);
      }, 250);

      const poll = async () => {
        if (cancelled || !ticketRef.current) return;
        const status = await pollMatchmaking(ticketRef.current);
        if (cancelled) return;
        if (status.ok && status.data.status === "assigned" && status.data.sessionId) {
          router.replace(`/play/${status.data.sessionId}`);
          return;
        }
        if (status.ok && status.data.status === "timeout") {
          setPhase("timeout");
          setMessage("No one available right now.");
          return;
        }
        pollTimer = window.setTimeout(() => void poll(), 1200);
      };
      pollTimer = window.setTimeout(() => void poll(), 1200);
    };

    void run();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      if (tickTimer) clearInterval(tickTimer);
      if (ticketRef.current) void cancelMatchmaking(ticketRef.current);
    };
  }, [router]);

  return (
    <PageShell
      centered
      logoHref="/play"
      headerRight={<RaceChrome currentMode="quick" />}
    >
      <Eyebrow>Quick Race</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        {phase === "searching" ? "Finding racers" : "No match"}
      </h1>
      <p className="mt-3 max-w-md text-sm text-chalk-muted">{message}</p>

      {phase === "searching" ? (
        <p className="mt-8 font-mono text-3xl text-cyan">{secondsLeft}s</p>
      ) : null}

      {phase === "timeout" || phase === "error" ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/play" variant="secondary">
            Try other modes
          </ButtonLink>
          <ButtonLink href="/play/solo">Play vs CPU now</ButtonLink>
          <Button
            type="button"
            variant="ghost"
            onClick={() => window.location.reload()}
          >
            Search again
          </Button>
        </div>
      ) : (
        <div className="mt-10">
          <ButtonLink href="/play" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      )}

      {phase === "timeout" ? (
        <p className="mt-6 text-xs text-chalk-muted">
          Try <span className="text-chalk">Open Race</span> (share a link) or{" "}
          <span className="text-chalk">Race CPU</span> while you wait.
        </p>
      ) : null}
    </PageShell>
  );
}
