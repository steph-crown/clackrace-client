"use client";

import { useEffect, useRef } from "react";

type TypingPanelProps = {
  passage: string;
  typed: string;
  enabled: boolean;
  onChar: (char: string) => void;
  onBackspace: () => void;
};

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
      {/* Regular spaces so the passage can wrap like a textarea */}
      <p className="font-mono text-base leading-relaxed break-words whitespace-pre-wrap sm:text-lg">
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
        {/* Trailing mistypes past passage end */}
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
        value=""
        rows={1}
        onChange={() => {
          /* keys handled below */
        }}
        onKeyDown={(e) => {
          if (!enabled) return;
          if (e.key === "Backspace") {
            e.preventDefault();
            onBackspace();
            return;
          }
          if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
            return;
          }
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            onChar(e.key);
          }
        }}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Race typing input"
        className="absolute inset-0 resize-none cursor-text opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
