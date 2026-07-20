"use client";

import { forwardRef } from "react";
import { placeLabel } from "@/lib/share/card";
import { cn } from "@/lib/utils/cn";

export type ResultCardProps = {
  name: string;
  wpm: number;
  accuracy: number;
  /** Third column — placement label or streak number. */
  thirdLabel?: string;
  thirdValue?: string;
  placement?: number;
  className?: string;
};

/** Landing-style result card (DOM) — used in share modal + landing mock. */
export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard(
    {
      name,
      wpm,
      accuracy,
      thirdLabel,
      thirdValue,
      placement,
      className,
    },
    ref,
  ) {
    const thirdL =
      thirdLabel ??
      (placement != null ? "Place" : "Streak");
    const thirdV =
      thirdValue ??
      (placement != null ? placeLabel(placement) : "—");

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-sm rounded-sm border border-lane bg-asphalt p-6 shadow-[0_20px_60px_rgb(0_0_0_/0.45)]",
          className,
        )}
      >
        <div className="checkered-strip absolute inset-x-0 top-0 h-1.5 rounded-t-sm" />
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan">
          Result card
        </p>
        <p className="mt-4 font-logo text-3xl text-chalk">{name.slice(0, 22)}</p>
        <div className="mt-6 flex items-end justify-between border-t border-lane pt-5">
          <div>
            <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
              WPM
            </p>
            <p className="font-heading text-4xl font-bold text-cyan">
              {Math.round(wpm)}
            </p>
          </div>
          <div>
            <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
              Accuracy
            </p>
            <p className="font-heading text-4xl font-bold text-chalk">
              {Math.round(accuracy)}%
            </p>
          </div>
          <div>
            <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
              {thirdL}
            </p>
            <p className="font-heading text-4xl font-bold text-signal">{thirdV}</p>
          </div>
        </div>
        <p className="mt-5 font-mono text-xs text-chalk-muted">
          #clackrace · beat this
        </p>
      </div>
    );
  },
);
