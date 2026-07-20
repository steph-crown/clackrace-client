"use client";

import { AuthNavActions } from "@/components/auth/AuthNavActions";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";

export function SiteNav() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-8">
      <Logo className="pointer-events-auto" />
      <nav
        className="pointer-events-auto flex items-center gap-3"
        aria-label="Primary"
      >
        <AuthNavActions />
        <ButtonLink href="/play" size="sm">
          Play now
        </ButtonLink>
      </nav>
    </header>
  );
}
