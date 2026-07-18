"use client";

import Link from "next/link";
import type { RacerResult } from "@/lib/race/results";

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
      <div className="text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Race complete
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold uppercase tracking-wide text-chalk">
          {you?.placement === 1 ? "You win" : `P${you?.placement ?? "—"}`}
        </h1>
        {you ? (
          <dl className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <dt className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                WPM
              </dt>
              <dd className="font-heading text-3xl font-bold text-cyan">
                {Math.round(you.wpm)}
              </dd>
            </div>
            <div>
              <dt className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                Accuracy
              </dt>
              <dd className="font-heading text-3xl font-bold text-chalk">
                {Math.round(you.accuracy)}%
              </dd>
            </div>
            <div>
              <dt className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                Place
              </dt>
              <dd className="font-heading text-3xl font-bold text-signal">
                {you.placement}
              </dd>
            </div>
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
        {results.map((r) => (
          <li
            key={r.id}
            className={`flex items-center justify-between rounded-sm border px-4 py-3 ${
              r.isYou
                ? "border-cyan/40 bg-cyan/5"
                : "border-lane bg-asphalt-raised"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-chalk-muted">
                #{r.placement}
              </span>
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
        ))}
      </ol>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-sm bg-cyan px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-asphalt transition-transform hover:scale-[1.02]"
        >
          Race again
        </button>
        <Link
          href="/play"
          className="rounded-sm border border-lane px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-chalk hover:border-chalk/40"
        >
          Modes
        </Link>
        <Link
          href="/signin"
          className="rounded-sm border border-lane px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wider text-chalk-muted hover:border-chalk/40 hover:text-chalk"
        >
          Save this run
        </Link>
      </div>
    </div>
  );
}
