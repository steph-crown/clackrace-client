import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClackRace Daily Champion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
      let username = "Open seat";
  let wpm = "—";
  let day = "UTC day";

  try {
    const api =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
      "http://localhost:4000";
    const res = await fetch(`${api}/leaderboard/daily-champion`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        champion?: { username?: string; bestWpm?: number; day?: string } | null;
      };
      if (data.champion) {
        username = (data.champion.username ?? username).slice(0, 24);
        wpm =
          data.champion.bestWpm != null
            ? String(Math.round(data.champion.bestWpm))
            : wpm;
        day = data.champion.day ?? day;
      }
    }
  } catch {
    /* static fallback */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #12141a 0%, #1c2030 100%)",
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
            color: "#f5c518",
            textTransform: "uppercase",
          }}
        >
          ClackRace · Daily Champion
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 700 }}>{username}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <span style={{ fontSize: 96, fontWeight: 700, color: "#2ee6d6" }}>
              {wpm}
            </span>
            <span style={{ fontSize: 36, color: "#8b92a5" }}>WPM peak</span>
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#8b92a5" }}>
          {day} · crown resets at midnight UTC
        </div>
      </div>
    ),
    { ...size },
  );
}
