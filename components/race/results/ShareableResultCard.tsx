"use client";

import { forwardRef } from "react";
import { placeLabel } from "@/lib/share/card";

export type ShareableResultCardProps = {
  wpm: number;
  accuracy: number;
  placement: number;
  name: string;
  modeLabel?: string;
};

/**
 * SVG twin of the landing ResultCard — used only for PNG export
 * (fonts approximated; layout matches the DOM card).
 */
export const ShareableResultCard = forwardRef<
  SVGSVGElement,
  ShareableResultCardProps
>(function ShareableResultCard(
  { wpm, accuracy, placement, name },
  ref,
) {
  const place = placeLabel(placement);
  return (
    <svg
      ref={ref}
      viewBox="0 0 420 320"
      width={420}
      height={320}
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      aria-hidden
    >
      <rect width="420" height="320" fill="#0e1016" />
      <rect width="420" height="8" fill="#e8e6e1" />
      <rect x="0" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="32" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="64" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="96" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="128" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="160" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="192" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="224" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="256" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="288" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="320" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="352" y="0" width="16" height="8" fill="#0c0e12" />
      <rect x="384" y="0" width="16" height="8" fill="#0c0e12" />
      <rect
        x="1"
        y="1"
        width="418"
        height="318"
        fill="none"
        stroke="#2a3142"
        strokeWidth="2"
      />
      <text
        x="28"
        y="52"
        fill="#2ee6d6"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="3.5"
      >
        RESULT CARD
      </text>
      <text
        x="28"
        y="100"
        fill="#e8e6e1"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="36"
      >
        {name.slice(0, 18)}
      </text>
      <line
        x1="28"
        y1="130"
        x2="392"
        y2="130"
        stroke="#2a3142"
        strokeWidth="1"
      />
      <text
        x="28"
        y="168"
        fill="#8b92a5"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        letterSpacing="1.5"
      >
        WPM
      </text>
      <text
        x="28"
        y="214"
        fill="#2ee6d6"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="40"
      >
        {Math.round(wpm)}
      </text>
      <text
        x="160"
        y="168"
        fill="#8b92a5"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        letterSpacing="1.5"
      >
        ACCURACY
      </text>
      <text
        x="160"
        y="214"
        fill="#e8e6e1"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="40"
      >
        {Math.round(accuracy)}%
      </text>
      <text
        x="310"
        y="168"
        fill="#8b92a5"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        letterSpacing="1.5"
      >
        PLACE
      </text>
      <text
        x="310"
        y="214"
        fill="#f5c518"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="36"
      >
        {place}
      </text>
      <text
        x="28"
        y="280"
        fill="#8b92a5"
        fontFamily="ui-monospace, monospace"
        fontSize="13"
      >
        #clackrace · beat this
      </text>
    </svg>
  );
});
