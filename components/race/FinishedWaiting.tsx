export function FinishedWaiting() {
  return (
    <div className="rounded-sm border border-cyan/40 bg-cyan/5 px-5 py-6 text-center">
      <p className="font-heading text-lg font-bold uppercase tracking-wide text-cyan">
        You finished!
      </p>
      <p className="mt-2 text-sm text-chalk-muted">
        Waiting for everyone else to cross the line…
      </p>
    </div>
  );
}
