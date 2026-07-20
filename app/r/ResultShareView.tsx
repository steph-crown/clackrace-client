"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { ShareResultInline } from "@/components/race/results/ShareResultActions";

export function ResultShareView() {
  const sp = useSearchParams();
  const wpm = Number(sp.get("wpm") ?? "0");
  const accuracy = Number(sp.get("acc") ?? "0");
  const placement = Number(sp.get("place") ?? "1");
  const name = sp.get("name") ?? "Racer";
  const mode = sp.get("mode") ?? "Race";

  return (
    <PageShell centered logoHref="/">
      <Eyebrow>Shared result</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
        Race card
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        A ClackRace finish — share it or jump in yourself.
      </p>
      <div className="mt-10 flex justify-center">
        <ShareResultInline
          wpm={Number.isFinite(wpm) ? wpm : 0}
          accuracy={Number.isFinite(accuracy) ? accuracy : 0}
          placement={Number.isFinite(placement) ? placement : 1}
          name={name}
          mode={mode}
        />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/play">Play now</ButtonLink>
        <ButtonLink href="/play/solo" variant="secondary">
          Race CPU
        </ButtonLink>
      </div>
    </PageShell>
  );
}
