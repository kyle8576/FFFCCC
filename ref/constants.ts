import { Player, Match, TournamentState } from './types';

export const INITIAL_PLAYERS: Player[] = Array.from({ length: 16 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Team ${i + 1}`,
}));

export const ADMIN_PASSWORD = 'admin';

// Helper to generate initial matches
const generateInitialMatches = (): Record<string, Match> => {
  const matches: Record<string, Match> = {};

  // R16: Matches 1-8
  for (let i = 1; i <= 8; i++) {
    const id = `m${i}`;
    matches[id] = {
      id,
      round: 'R16',
      a: `p${i * 2 - 1}`,
      b: `p${i * 2}`,
      winner: null,
      status: 'pending',
      next: {
        id: `m${Math.ceil(i / 2) + 8}`,
        slot: i % 2 !== 0 ? 'a' : 'b',
      },
    };
  }

  // QF: Matches 9-12
  for (let i = 9; i <= 12; i++) {
    const id = `m${i}`;
    matches[id] = {
      id,
      round: 'QF',
      a: null,
      b: null,
      winner: null,
      status: 'pending',
      next: {
        id: `m${Math.ceil((i - 8) / 2) + 12}`,
        slot: (i - 8) % 2 !== 0 ? 'a' : 'b',
      },
    };
  }

  // SF: Matches 13-14
  for (let i = 13; i <= 14; i++) {
    const id = `m${i}`;
    matches[id] = {
      id,
      round: 'SF',
      a: null,
      b: null,
      winner: null,
      status: 'pending',
      next: {
        id: 'm15',
        slot: (i - 12) % 2 !== 0 ? 'a' : 'b',
      },
    };
  }

  // F: Match 15
  matches['m15'] = {
    id: 'm15',
    round: 'F',
    a: null,
    b: null,
    winner: null,
    status: 'pending',
    next: null,
  };

  return matches;
};

const playersMap = INITIAL_PLAYERS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, Player>);

export const INITIAL_STATE: TournamentState = {
  players: playersMap,
  matches: generateInitialMatches(),
  liveMatchId: null,
  updatedAt: Date.now(),
};
