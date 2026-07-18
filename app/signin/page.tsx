import Link from "next/link";

export default function SignInPlaceholderPage() {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
        Sign in
      </h1>
      <p className="mt-3 max-w-sm text-chalk-muted">
        Accounts ship in Phase 5. You can still Play Now as a guest.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/play"
          className="rounded-sm bg-cyan px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-asphalt"
        >
          Play Now
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-lane px-5 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider text-chalk"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
