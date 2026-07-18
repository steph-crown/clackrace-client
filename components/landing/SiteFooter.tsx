import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-lane bg-asphalt px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-logo text-xl text-chalk">
          Clack<span className="text-cyan">Race</span>
        </Link>
        <nav className="flex flex-wrap gap-5 font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted">
          <Link href="/play" className="hover:text-chalk">
            Play
          </Link>
          <Link href="/signin" className="hover:text-chalk">
            Sign in
          </Link>
          <a
            href="mailto:hello@clackrace.com"
            className="hover:text-chalk"
          >
            Contact
          </a>
        </nav>
        <p className="text-xs text-chalk-muted">
          © {new Date().getFullYear()} ClackRace
        </p>
      </div>
    </footer>
  );
}
