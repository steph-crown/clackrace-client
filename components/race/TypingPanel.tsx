"use client";

import { useEffect, useRef } from "react";

type TypingPanelProps = {
  passage: string;
  typed: string;
  enabled: boolean;
  onChar: (char: string) => void;
  onBackspace: () => void;
};

/**
 * Mobile-safe typing: real devices often skip per-key `keydown` for characters.
 * Drive from the controlled value via `onChange` (same idea as the hero strip).
 */
export function TypingPanel({
  passage,
  typed,
  enabled,
  onChar,
  onBackspace,
}: TypingPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
  }, [enabled]);

  return (
    <div
      className="relative w-full cursor-text rounded-sm border border-lane bg-asphalt-raised px-4 py-4 sm:px-5 sm:py-5"
      onClick={() => inputRef.current?.focus()}
    >
      <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
        {enabled ? "Type the passage" : "Wait for green…"}
      </p>
      <p
        className="pointer-events-none font-mono text-base leading-relaxed break-words whitespace-pre-wrap sm:text-lg"
        aria-hidden
      >
        {passage.split("").map((char, i) => {
          let cls = "text-chalk-muted";
          if (i < typed.length) {
            cls =
              typed[i] === char
                ? "text-cyan"
                : "text-danger underline decoration-danger";
          } else if (i === typed.length && enabled) {
            cls = "text-chalk border-b-2 border-signal";
          }
          return (
            <span key={`${i}-${char}`} className={cls}>
              {char}
            </span>
          );
        })}
        {typed.length > passage.length
          ? typed
              .slice(passage.length)
              .split("")
              .map((char, i) => (
                <span
                  key={`extra-${i}`}
                  className="text-danger underline decoration-danger"
                >
                  {char}
                </span>
              ))
          : null}
      </p>
      <textarea
        ref={inputRef}
        disabled={!enabled}
        value={typed}
        rows={3}
        inputMode="text"
        enterKeyHint="done"
        onChange={(e) => {
          if (!enabled) return;
          const next = e.target.value;
          if (next.length < typed.length) {
            const n = typed.length - next.length;
            for (let i = 0; i < n; i++) onBackspace();
            return;
          }
          if (next.length > typed.length) {
            const added = next.slice(typed.length);
            for (const ch of added) {
              if (ch === "\n" || ch === "\r") continue;
              onChar(ch);
            }
          }
        }}
        onKeyDown={(e) => {
          // Keep desktop shortcuts snappy; mobile mainly uses onChange.
          if (!enabled) return;
          if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Race typing input"
        className="absolute inset-0 z-10 resize-none bg-transparent text-base caret-signal text-transparent selection:bg-cyan/30 disabled:cursor-not-allowed"
      />
    </div>
  );
}
