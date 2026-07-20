"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  copyPngToClipboard,
  copyText,
  downloadPng,
  svgElementToPngBlob,
  webShare,
} from "@/lib/share/card";

type ShareChampionActionsProps = {
  username: string;
  bestWpm: number;
  day: string;
  carColor?: string;
};

export function ShareChampionActions({
  username,
  bestWpm,
  day,
  carColor = "#f5c518",
}: ShareChampionActionsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/champion`
      : "/champion";

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
      const file = new File([blob], "clackrace-champion.png", {
        type: "image/png",
      });
      const result = await webShare({
        title: "ClackRace Daily Champion",
        text: `${username} holds the Daily Champion crown at ${Math.round(bestWpm)} WPM`,
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
      await downloadPng(blob, `clackrace-champion-${day}.png`);
      flash("Downloaded");
    } catch {
      flash("Download failed");
    }
  };

  const onCopyLink = async () => {
    flash((await copyText(url)) ? "Link copied" : "Copy failed");
  };

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="overflow-hidden rounded-sm border border-lane">
        <svg
          ref={svgRef}
          viewBox="0 0 640 360"
          className="h-auto w-full"
          role="img"
          aria-label={`${username} Daily Champion`}
        >
          <defs>
            <linearGradient id="chAsphalt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#12141a" />
              <stop offset="100%" stopColor="#1c2030" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#chAsphalt)" />
          <rect x="0" y="0" width="640" height="6" fill="#f5c518" />
          <text
            x="40"
            y="64"
            fill="#8b92a5"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="14"
            letterSpacing="4"
          >
            CLACKRACE · DAILY CHAMPION
          </text>
          <text
            x="40"
            y="140"
            fill="#e8e6e1"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
            fontSize="48"
          >
            {username.slice(0, 20)}
          </text>
          <circle cx="560" cy="120" r="36" fill={carColor} />
          <text
            x="40"
            y="220"
            fill="#2ee6d6"
            fontFamily="ui-monospace, monospace"
            fontSize="56"
            fontWeight="700"
          >
            {Math.round(bestWpm)}
          </text>
          <text
            x="200"
            y="220"
            fill="#8b92a5"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="22"
          >
            WPM peak
          </text>
          <text
            x="40"
            y="300"
            fill="#8b92a5"
            fontFamily="ui-monospace, monospace"
            fontSize="16"
          >
            {day} · crown resets at midnight UTC
          </text>
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" onClick={() => void onShare()}>
          Share
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void onCopyImage()}
        >
          Copy image
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void onDownload()}
        >
          Download
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => void onCopyLink()}
        >
          Copy link
        </Button>
      </div>
      {status ? (
        <p className="text-center text-xs text-cyan">{status}</p>
      ) : null}
    </div>
  );
}
