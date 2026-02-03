export interface Player {
  id: string;
  name: string;
}

export type Round = 'R16' | 'QF' | 'SF' | 'F';
export type MatchStatus = 'pending' | 'live' | 'done';

export interface NextMatchRef {
  id: string;
  slot: 'a' | 'b';
}

export interface Match {
  id: string;
  round: Round;
  a: string | null; // Player ID
  b: string | null; // Player ID
  winner: string | null; // Player ID
  status: MatchStatus;
  next: NextMatchRef | null;
}

export interface TournamentState {
  players: Record<string, Player>;
  matches: Record<string, Match>;
  liveMatchId: string | null;
  updatedAt: number;
}

export interface TournamentContextType {
  state: TournamentState;
  isAdmin: boolean;
  login: (password: string) => boolean;
  setLive: (matchId: string) => void;
  setWinner: (matchId: string, winnerId: string) => void;
  undo: () => void;
  reset: () => void;
}
