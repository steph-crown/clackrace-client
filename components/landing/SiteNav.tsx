import Link from "next/link";

export function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-8">
      <Link
        href="/"
        className="pointer-events-auto font-logo text-2xl tracking-wide text-chalk sm:text-3xl"
      >
        Clack<span className="text-cyan">Race</span>
      </Link>
      <nav className="pointer-events-auto flex items-center gap-3">
        <Link
          href="/signin"
          className="rounded-sm border border-chalk/25 px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wider text-chalk transition-colors hover:border-chalk/50 hover:bg-chalk/5"
        >
          Sign in
        </Link>
        <Link
          href="/play"
          className="rounded-sm bg-cyan px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wider text-asphalt transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Play Now
        </Link>
      </nav>
    </header>
  );
}
