"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CarSvg } from "@/components/race/CarSvg";

const HERO_PASSAGE = "type fast drive faster";

export function HeroTypingStrip() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  const correctLen = (() => {
    let n = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === HERO_PASSAGE[i]) n++;
      else break;
    }
    return n;
  })();

  const progress = correctLen / HERO_PASSAGE.length;
  const finished = correctLen >= HERO_PASSAGE.length;

  useEffect(() => {
    if (!finished) return;
    const t = window.setTimeout(() => router.push("/play"), 450);
    return () => window.clearTimeout(t);
  }, [finished, router]);

  return (
    <div className="relative w-full max-w-xl">
      {/* Mini track */}
      <div className="relative mb-4 h-14 overflow-hidden rounded-sm border border-lane bg-track">
        <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-chalk-muted/30" />
        <div
          className="absolute top-1/2 w-20 will-change-transform"
          style={{
            left: `calc(${progress * 100}% - ${progress * 5}rem)`,
            transform: "translateY(-50%)",
          }}
        >
          <CarSvg
            bodyColor="var(--cyan)"
            accentColor="var(--signal)"
            label={progress > 0 ? "You" : undefined}
          />
        </div>
        <div className="checkered-strip absolute right-0 top-0 h-full w-3 opacity-80" />
      </div>

      <button
        type="button"
        className="group relative w-full cursor-text rounded-sm border border-lane bg-asphalt-raised/90 px-4 py-3 text-left outline-none transition-colors focus-within:border-cyan"
        onClick={() => inputRef.current?.focus()}
      >
        <p className="mb-1 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          {started ? "Keep going — finish to race" : "Try it — type this"}
        </p>
        <p
          className="font-mono text-base leading-relaxed tracking-wide sm:text-lg"
          aria-hidden
        >
          {HERO_PASSAGE.split("").map((char, i) => {
            let color = "text-chalk-muted";
            if (i < typed.length) {
              color = typed[i] === char ? "text-cyan" : "text-danger underline";
            } else if (i === typed.length) {
              color = "text-chalk border-b-2 border-signal";
            }
            return (
              <span key={`${char}-${i}`} className={color}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </p>
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => {
            if (!started) setStarted(true);
            if (finished) return;
            setTyped(e.target.value.slice(0, HERO_PASSAGE.length + 2));
          }}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Type the sample sentence to start racing"
          className="absolute inset-0 cursor-text opacity-0"
        />
      </button>
    </div>
  );
}
