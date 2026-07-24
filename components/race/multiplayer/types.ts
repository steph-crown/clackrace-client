export type MultiplayerPhase =
  | "connecting"
  | "lobby"
  | "waiting_race"
  | "countdown"
  | "racing"
  | "results"
  | "ended"
  | "error";

export type SessionMember = {
  id: string;
  displayName: string;
  carColor: string;
  isCreator: boolean;
  pending: boolean;
  disconnected: boolean;
  username?: string | null;
  rating?: number | null;
};

export type SessionLeaderboardEntry = {
  memberId: string;
  displayName: string;
  bestWpm: number;
  racesPlayed: number;
};

export type MultiplayerRaceResult = {
  memberId: string;
  displayName: string;
  carColor: string;
  wpm: number;
  accuracy: number;
  finished: boolean;
  placement: number;
  disconnected: boolean;
};
