"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  return (
    <footer className="relative z-20 border-t border-lane bg-asphalt px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo size="sm" />
        <nav
          className="flex flex-wrap gap-5 font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted"
          aria-label="Footer"
        >
          <Link href="/play" className="hover:text-chalk">
            Play
          </Link>
          {signedIn ? (
            <>
              <Link href="/stats" className="hover:text-chalk">
                Stats
              </Link>
              <Link href="/settings" className="hover:text-chalk">
                Settings
              </Link>
            </>
          ) : (
            <Link href="/signin" className="hover:text-chalk">
              Sign in
            </Link>
          )}
          <a href="mailto:hello@clackrace.com" className="hover:text-chalk">
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
