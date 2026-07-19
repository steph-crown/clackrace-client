"use client";

import type { RacerResult } from "@/lib/race/results";
import { podiumTier } from "@/lib/race/placement";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatBlock } from "@/components/ui/StatBlock";
import { cn } from "@/lib/utils/cn";
import { MedalBadge } from "./results/MedalBadge";
import { PlacementHeadline } from "./results/PlacementHeadline";
import { RaceChrome } from "./RaceChrome";

type ResultScreenProps = {
  results: RacerResult[];
  submitted: boolean | null;
  onPlayAgain: () => void;
};

export function ResultScreen({
  results,
  submitted,
  onPlayAgain,
}: ResultScreenProps) {
  const you = results.find((r) => r.isYou);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex justify-end">
        <RaceChrome currentMode="solo" />
      </div>

      <div className="text-center">
        <Eyebrow>Race complete</Eyebrow>
        {you ? <div className="mt-4"><PlacementHeadline placement={you.placement} /></div> : null}
        {you ? (
          <dl className="mt-6 grid grid-cols-3 gap-4">
            <StatBlock
              label="WPM"
              value={String(Math.round(you.wpm))}
              accent="cyan"
            />
            <StatBlock
              label="Accuracy"
              value={`${Math.round(you.accuracy)}%`}
            />
            <StatBlock
              label="Place"
              value={String(you.placement)}
              accent="signal"
            />
          </dl>
        ) : null}
        {submitted === true ? (
          <p className="mt-3 text-xs text-chalk-muted">Run saved</p>
        ) : submitted === false ? (
          <p className="mt-3 text-xs text-chalk-muted">
            Couldn&apos;t reach server — run kept locally
          </p>
        ) : null}
      </div>

      <ol className="space-y-2">
        {results.map((r) => {
          const tier = podiumTier(r.placement);
          return (
            <li
              key={r.id}
              className={cn(
                "flex items-center justify-between rounded-sm border px-4 py-3",
                r.isYou
                  ? "border-cyan/40 bg-cyan/5"
                  : "border-lane bg-asphalt-raised",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-chalk-muted">
                  #{r.placement}
                </span>
                <MedalBadge tier={tier} />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: r.bodyColor }}
                />
                <span className="font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                  {r.name}
                </span>
              </div>
              <span className="font-mono text-sm text-chalk">
                {Math.round(r.wpm)} WPM
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={onPlayAgain}>
          Race again
        </Button>
        <ButtonLink href="/play" variant="secondary">
          Modes
        </ButtonLink>
        <ButtonLink href="/signin" variant="secondary" className="text-chalk-muted">
          Save this run
        </ButtonLink>
      </div>
    </div>
  );
}
