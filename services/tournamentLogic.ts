import { TournamentState } from '../types';
import { INITIAL_STATE } from '../constants';

// Deep clone helper
const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const setLiveMatch = (
  state: TournamentState,
  matchId: string
): TournamentState => {
  const newState = clone(state);
  
  // Reset previous live match if any
  if (newState.liveMatchId && newState.matches[newState.liveMatchId]) {
    // If it was just marked live but not finished, revert to pending?
    // Requirement says "system allows 1 match to be live".
    // We just update the ID reference. The visual status derives from this ID + done status.
    const prevLive = newState.matches[newState.liveMatchId];
    if (prevLive.status === 'live') {
        prevLive.status = 'pending';
    }
  }

  // Set new match to live
  if (newState.matches[matchId]) {
    newState.matches[matchId].status = 'live';
    newState.liveMatchId = matchId;
  }

  newState.updatedAt = Date.now();
  return newState;
};

export const setMatchWinner = (
  state: TournamentState,
  matchId: string,
  winnerId: string
): TournamentState => {
  const newState = clone(state);
  const match = newState.matches[matchId];

  if (!match) return state;

  // 1. Mark current match as done
  match.winner = winnerId;
  match.status = 'done';

  // If this match was live, clear global live reference (or keep it until manual change? Requirement implies auto-advance logic might need TBD, but let's just clear live status on the match itself)
  if (newState.liveMatchId === matchId) {
    newState.liveMatchId = null; 
  }

  // 2. Advance to next match
  if (match.next) {
    const nextMatch = newState.matches[match.next.id];
    if (nextMatch) {
      if (match.next.slot === 'a') {
        nextMatch.a = winnerId;
      } else {
        nextMatch.b = winnerId;
      }
      // Ensure next match is pending if it was waiting
      if (nextMatch.status === 'done') {
        // Edge case: if we are overwriting a previous path (unlikely in pure forward flow, but possible if resetting), reset next match winner?
        // For simplicity in this version, we assume linear progression. 
        // Ideally, if we change a winner, we should propagate reset to future matches.
        // But the requirement is simple forward progression.
      }
    }
  }

  newState.updatedAt = Date.now();
  return newState;
};

export const resetTournament = (): TournamentState => {
  const newState = clone(INITIAL_STATE);
  newState.updatedAt = Date.now(); // Use current timestamp for sync
  return newState;
};
