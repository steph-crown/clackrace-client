import type { Metadata } from "next";
import { ChampionPageClient } from "./ChampionPageClient";

export const metadata: Metadata = {
  title: "Daily Champion — ClackRace",
  description: "Today’s top WPM holds the ClackRace crown until midnight UTC.",
  openGraph: {
    title: "ClackRace Daily Champion",
    description: "Type fast. Drive faster.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClackRace Daily Champion",
  },
};

export default function ChampionPage() {
  return <ChampionPageClient />;
}
