import { SoloRaceApp } from "@/components/race/SoloRaceApp";

type SoloPageProps = {
  searchParams: Promise<{ beat?: string }>;
};

export default async function SoloPage({ searchParams }: SoloPageProps) {
  const sp = await searchParams;
  return <SoloRaceApp autoBeat={sp.beat === "1"} />;
}
