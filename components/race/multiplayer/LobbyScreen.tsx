"use client";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { StatBlock } from "@/components/ui/StatBlock";
import { Toast } from "@/components/ui/Toast";
import { InviteLinkCard } from "@/components/race/InviteLinkCard";
import { RacerList } from "./RacerList";
import { SessionLeaderboard } from "./SessionLeaderboard";
import type {
  MultiplayerRaceResult,
  SessionLeaderboardEntry,
  SessionMember,
} from "./types";

type LobbyScreenProps = {
  sessionId: string;
  displayName: string;
  isCreator: boolean;
  phase: "lobby" | "results";
  members: SessionMember[];
  memberId: string | null;
  leaderboard: SessionLeaderboardEntry[];
  results: MultiplayerRaceResult[];
  shareUrl: string;
  toast?: string | null;
  onStartRace: () => void;
  onPlayAgain: () => void;
  onEndSession: () => void;
  onLeave: () => void;
};

export function LobbyScreen({
  sessionId,
  displayName,
  isCreator,
  phase,
  members,
  memberId,
  leaderboard,
  results,
  shareUrl,
  toast,
  onStartRace,
  onPlayAgain,
  onEndSession,
  onLeave,
}: LobbyScreenProps) {
  const youResult = results.find((r) => r.memberId === memberId);

  return (
    <PageShell centered logoHref="/play">
      {toast ? <Toast message={toast} /> : null}
      <Eyebrow>Race Code: {sessionId}</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk sm:text-4xl">
        {phase === "results" ? "Race complete" : "Lobby"}
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        Racing as {displayName} — you always see yourself as{" "}
        <span className="text-cyan">You</span>
      </p>

      <div className="mt-8">
        <InviteLinkCard shareUrl={shareUrl} />
      </div>

      {phase === "lobby" && !isCreator ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onLeave}
          className="mt-4"
        >
          Leave
        </Button>
      ) : null}

      {phase === "results" && youResult ? (
        <dl className="mt-8 grid grid-cols-3 gap-4">
          <StatBlock label="Place" value={`#${youResult.placement}`} />
          <StatBlock
            label="WPM"
            value={String(Math.round(youResult.wpm))}
            accent="cyan"
          />
          <StatBlock
            label="Accuracy"
            value={`${Math.round(youResult.accuracy)}%`}
          />
        </dl>
      ) : null}

      <div className="mt-10">
        <RacerList members={members} memberId={memberId} />
      </div>

      <div className="mt-10">
        <SessionLeaderboard entries={leaderboard} memberId={memberId} />
      </div>

      {isCreator ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {phase === "lobby" ? (
            <Button type="button" onClick={onStartRace}>
              Start race
            </Button>
          ) : (
            <Button type="button" onClick={onPlayAgain}>
              Play again
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onEndSession}>
            End session
          </Button>
        </div>
      ) : phase === "lobby" ? (
        <p className="mt-10 text-sm text-chalk-muted">
          Waiting for the host to start…
        </p>
      ) : (
        <p className="mt-10 text-sm text-chalk-muted">
          Waiting for the host to rematch…
        </p>
      )}
    </PageShell>
  );
}
