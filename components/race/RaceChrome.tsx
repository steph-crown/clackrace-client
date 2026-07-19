"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { raceAudio } from "@/lib/audio/manager";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type RaceChromeProps = {
  /** Highlight current mode in the menu. */
  currentMode?: "solo" | "public" | "challenge" | null;
  /** Compact trigger for live race (overflow only). */
  compact?: boolean;
  className?: string;
  /** Optional extra actions (e.g. Restart). */
  extras?: React.ReactNode;
};

export function RaceChrome({
  currentMode = null,
  compact = false,
  className,
  extras,
}: RaceChromeProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(() =>
    typeof window === "undefined" ? false : raceAudio.isMuted(),
  );
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleMute = () => {
    void raceAudio.ensureUnlocked();
    setMuted(raceAudio.toggleMute());
  };

  return (
    <div ref={rootRef} className={cn("relative flex items-center gap-2", className)}>
      {extras}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        aria-pressed={muted}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "Muted" : "Sound"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          void raceAudio.ensureUnlocked();
          setOpen((v) => !v);
        }}
      >
        {compact ? "Menu" : "Modes"}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-sm border border-lane bg-asphalt-raised p-2 shadow-lg"
        >
          <p className="px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            Switch mode
          </p>
          <MenuLink
            href="/play/solo"
            active={currentMode === "solo"}
            onNavigate={() => setOpen(false)}
          >
            Race CPU
          </MenuLink>
          <MenuLink
            href="/play/public"
            active={currentMode === "public"}
            onNavigate={() => setOpen(false)}
          >
            Public Multiplayer
          </MenuLink>
          <MenuLink
            href="/challenge"
            active={currentMode === "challenge"}
            onNavigate={() => setOpen(false)}
          >
            Challenge a Friend
          </MenuLink>
          <div className="my-2 border-t border-lane/60" />
          <MenuLink href="/leaderboard" onNavigate={() => setOpen(false)}>
            Leaderboard
          </MenuLink>
          <MenuLink href="/settings" onNavigate={() => setOpen(false)}>
            Settings
          </MenuLink>
          <MenuLink href="/play" onNavigate={() => setOpen(false)}>
            All modes
          </MenuLink>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  children,
  active,
  muted,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  muted?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "block rounded-sm px-3 py-2 font-heading text-xs font-semibold uppercase tracking-wider transition-colors",
        active
          ? "bg-cyan/10 text-cyan"
          : muted
            ? "text-chalk-muted hover:bg-chalk/5 hover:text-chalk"
            : "text-chalk hover:bg-chalk/5",
      )}
    >
      {children}
    </Link>
  );
}
