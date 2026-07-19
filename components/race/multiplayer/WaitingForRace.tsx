import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { Toast } from "@/components/ui/Toast";

type WaitingForRaceProps = {
  sessionId: string;
  toast?: string | null;
};

export function WaitingForRace({ sessionId, toast }: WaitingForRaceProps) {
  return (
    <PageShell centered logoHref="/play">
      {toast ? <Toast message={toast} /> : null}
      <Eyebrow>Race Code: {sessionId}</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-chalk">
        Hang tight
      </h1>
      <p className="mt-3 text-chalk-muted">
        A race is in progress — you&apos;ll be added when it ends.
      </p>
      <div className="mt-10 h-1 w-40 animate-pulse bg-cyan/40" />
    </PageShell>
  );
}
