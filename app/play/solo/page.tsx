import Link from "next/link";

export default function SoloPlaceholderPage() {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
        Race CPU
      </h1>
      <p className="mt-3 max-w-sm text-chalk-muted">
        Solo races land in Phase 2 — the full typing engine and CPU opponents.
      </p>
      <Link
        href="/play"
        className="mt-8 rounded-sm border border-lane px-5 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-chalk hover:border-cyan/50"
      >
        ← Back to modes
      </Link>
    </main>
  );
}
