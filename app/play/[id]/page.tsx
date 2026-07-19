import { MultiplayerRaceApp } from "@/components/race/MultiplayerRaceApp";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicMultiplayerPage({ params }: Props) {
  const { id } = await params;
  return <MultiplayerRaceApp sessionId={id.toUpperCase()} />;
}
