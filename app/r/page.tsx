import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultShareView } from "./ResultShareView";

type Search = {
  wpm?: string;
  acc?: string;
  place?: string;
  name?: string;
  mode?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const wpm = sp.wpm ?? "—";
  const name = sp.name ?? "Racer";
  const place = sp.place ?? "";
  return {
    title: `${name} · ${wpm} WPM — ClackRace`,
    description: `${name} hit ${wpm} WPM${place ? ` (${place})` : ""} on ClackRace.`,
    openGraph: {
      title: `${name} · ${wpm} WPM`,
      description: "Type fast. Drive faster.",
      images: [
        {
          url: `/r/opengraph-image?${new URLSearchParams({
            wpm: sp.wpm ?? "0",
            acc: sp.acc ?? "0",
            place: sp.place ?? "1",
            name: sp.name ?? "You",
            mode: sp.mode ?? "Race",
          }).toString()}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} · ${wpm} WPM`,
    },
  };
}

export default function ResultSharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-asphalt text-chalk-muted">
          Loading…
        </div>
      }
    >
      <ResultShareView />
    </Suspense>
  );
}
