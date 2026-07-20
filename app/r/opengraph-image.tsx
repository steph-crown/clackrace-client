import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string, fallback: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) ?? fallback;
  };
  const wpm = pick("wpm", "0");
  const acc = pick("acc", "0");
  const place = pick("place", "1");
  const name = pick("name", "Racer").slice(0, 24);
  const mode = pick("mode", "Race").slice(0, 20);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0e1016 0%, #1a2030 100%)",
          color: "#e8e6e1",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 4,
            color: "#8b92a5",
            textTransform: "uppercase",
          }}
        >
          ClackRace · {mode}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 700 }}>{name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <span style={{ fontSize: 96, fontWeight: 700, color: "#2ee6d6" }}>
              {wpm}
            </span>
            <span style={{ fontSize: 36, color: "#8b92a5" }}>WPM</span>
          </div>
          <div style={{ fontSize: 32, color: "#e8e6e1" }}>
            {place}
            {ordinal(Number(place))} · {acc}% accuracy
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#8b92a5" }}>
          Type fast. Drive faster.
        </div>
      </div>
    ),
    { ...size },
  );
}

function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (k >= 11 && k <= 13) return "th";
  if (j === 1) return "st";
  if (j === 2) return "nd";
  if (j === 3) return "rd";
  return "th";
}
