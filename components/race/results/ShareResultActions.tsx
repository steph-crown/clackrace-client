"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  copyPngToClipboard,
  copyText,
  downloadPng,
  placeLabel,
  resultShareUrl,
  svgElementToPngBlob,
  webShare,
  type ResultShareParams,
} from "@/lib/share/card";
import { ResultCard } from "./ResultCard";
import { ShareableResultCard } from "./ShareableResultCard";

type ShareResultButtonProps = ResultShareParams & {
  variant?: "secondary" | "ghost";
  size?: "sm" | "md";
};

function useShareActions(params: ResultShareParams) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const url = resultShareUrl(params);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const getBlob = async () => {
    const el = svgRef.current;
    if (!el) throw new Error("missing svg");
    return svgElementToPngBlob(el);
  };

  const onShare = async () => {
    try {
      const blob = await getBlob();
      const file = new File([blob], "clackrace-result.png", {
        type: "image/png",
      });
      const result = await webShare({
        title: "ClackRace result",
        text: `${params.name} finished ${placeLabel(params.placement)} at ${Math.round(params.wpm)} WPM on ClackRace`,
        url,
        file,
      });
      flash(
        result === "shared"
          ? "Shared"
          : result === "copied"
            ? "Link copied"
            : "Couldn’t share",
      );
    } catch {
      flash("Couldn’t share");
    }
  };

  const onCopyImage = async () => {
    try {
      const blob = await getBlob();
      const ok = await copyPngToClipboard(blob);
      if (ok) {
        flash("Image copied");
        return;
      }
      flash((await copyText(url)) ? "Link copied" : "Copy failed");
    } catch {
      flash("Copy failed");
    }
  };

  const onDownload = async () => {
    try {
      const blob = await getBlob();
      await downloadPng(blob, `clackrace-${Math.round(params.wpm)}wpm.png`);
      flash("Downloaded");
    } catch {
      flash("Download failed");
    }
  };

  const onCopyLink = async () => {
    flash((await copyText(url)) ? "Link copied" : "Copy failed");
  };

  return {
    svgRef,
    status,
    onShare,
    onCopyImage,
    onDownload,
    onCopyLink,
  };
}

function ShareActionButtons({
  onShare,
  onCopyImage,
  onDownload,
  onCopyLink,
  status,
}: {
  onShare: () => void;
  onCopyImage: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  status: string | null;
}) {
  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" onClick={onShare}>
          Share
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCopyImage}>
          Copy image
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onDownload}>
          Download
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCopyLink}>
          Copy link
        </Button>
      </div>
      {status ? (
        <p className="mt-3 text-center text-xs text-cyan">{status}</p>
      ) : null}
    </>
  );
}

/** CTA beside race results — opens landing-style card in a modal. */
export function ShareResultButton({
  wpm,
  accuracy,
  placement,
  name,
  mode,
  variant = "secondary",
  size = "md",
}: ShareResultButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const params: ResultShareParams = { wpm, accuracy, placement, name, mode };
  const actions = useShareActions(params);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
      >
        Share card
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-asphalt/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-sm border border-lane bg-asphalt-raised p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id={titleId}
                  className="font-heading text-lg font-bold uppercase tracking-wide text-chalk"
                >
                  Share your run
                </h2>
                <p className="mt-1 text-sm text-chalk-muted">
                  Copy the card or link — results stay on the board.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted hover:text-chalk"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex justify-center">
              <ResultCard
                name={name}
                wpm={wpm}
                accuracy={accuracy}
                placement={placement}
              />
            </div>

            <ShareableResultCard
              ref={actions.svgRef}
              wpm={wpm}
              accuracy={accuracy}
              placement={placement}
              name={name}
              modeLabel={mode}
            />

            <div className="mt-5">
              <ShareActionButtons
                status={actions.status}
                onShare={() => void actions.onShare()}
                onCopyImage={() => void actions.onCopyImage()}
                onDownload={() => void actions.onDownload()}
                onCopyLink={() => void actions.onCopyLink()}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Inline card + actions for the public `/r` share page. */
export function ShareResultInline(props: ResultShareParams) {
  const actions = useShareActions(props);
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <ResultCard
        name={props.name}
        wpm={props.wpm}
        accuracy={props.accuracy}
        placement={props.placement}
      />
      <ShareableResultCard
        ref={actions.svgRef}
        wpm={props.wpm}
        accuracy={props.accuracy}
        placement={props.placement}
        name={props.name}
        modeLabel={props.mode}
      />
      <ShareActionButtons
        status={actions.status}
        onShare={() => void actions.onShare()}
        onCopyImage={() => void actions.onCopyImage()}
        onDownload={() => void actions.onDownload()}
        onCopyLink={() => void actions.onCopyLink()}
      />
    </div>
  );
}
