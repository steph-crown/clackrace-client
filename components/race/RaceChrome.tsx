"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AuthNavActions } from "@/components/auth/AuthNavActions";
import { track } from "@/lib/analytics/track";
import { raceAudio } from "@/lib/audio/manager";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { RaceChromeMenuLink } from "./RaceChromeMenuLink";

type RaceChromeProps = {
  /** Highlight current mode in the menu. */
  currentMode?: "solo" | "public" | "quick" | "challenge" | null;
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

  const close = () => setOpen(false);

  return (
    <div
      ref={rootRef}
      className={cn("relative flex items-center gap-2", className)}
    >
      {extras}
      {!compact ? <AuthNavActions size="sm" /> : null}
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
          setOpen((v) => {
            if (!v) track("menu_open");
            return !v;
          });
        }}
      >
        Menu
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
          <RaceChromeMenuLink
            href="/play/solo"
            active={currentMode === "solo"}
            onNavigate={close}
          >
            Race CPU
          </RaceChromeMenuLink>
          <RaceChromeMenuLink
            href="/play/public"
            active={currentMode === "public"}
            onNavigate={close}
          >
            Open Race
          </RaceChromeMenuLink>
          <RaceChromeMenuLink
            href="/play/quick"
            active={currentMode === "quick"}
            onNavigate={close}
          >
            Quick Race
          </RaceChromeMenuLink>
          <RaceChromeMenuLink
            href="/challenge"
            active={currentMode === "challenge"}
            onNavigate={close}
          >
            Challenge a Friend
          </RaceChromeMenuLink>
          <div className="my-2 border-t border-lane/60" />
          <RaceChromeMenuLink href="/leaderboard" onNavigate={close}>
            Leaderboard
          </RaceChromeMenuLink>
          <RaceChromeMenuLink href="/stats" onNavigate={close}>
            Stats
          </RaceChromeMenuLink>
          <RaceChromeMenuLink href="/settings" onNavigate={close}>
            Settings
          </RaceChromeMenuLink>
          <RaceChromeMenuLink href="/play" onNavigate={close}>
            All races
          </RaceChromeMenuLink>
        </div>
      ) : null}
    </div>
  );
}
