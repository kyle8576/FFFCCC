import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { TournamentState } from '../types';
import { INITIAL_STATE, ADMIN_PASSWORD } from '../constants';
import { setLiveMatch, setMatchWinner, resetTournament } from '../services/tournamentLogic';

// --- Actions ---
type Action =
  | { type: 'SET_STATE'; payload: TournamentState }
  | { type: 'SET_LIVE'; payload: string }
  | { type: 'SET_WINNER'; payload: { matchId: string; winnerId: string } }
  | { type: 'UNDO' }
  | { type: 'RESET' };

// --- State + History Wrapper ---
interface StateWithHistory {
  current: TournamentState;
  history: TournamentState[];
}

const initialStateWrapper: StateWithHistory = {
  current: INITIAL_STATE,
  history: [],
};

// --- Reducer ---
const tournamentReducer = (state: StateWithHistory, action: Action): StateWithHistory => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, current: action.payload };

    case 'SET_LIVE': {
      const newCurrent = setLiveMatch(state.current, action.payload);
      return {
        current: newCurrent,
        history: [...state.history, state.current], // Push old state to history
      };
    }

    case 'SET_WINNER': {
      const newCurrent = setMatchWinner(
        state.current,
        action.payload.matchId,
        action.payload.winnerId
      );
      return {
        current: newCurrent,
        history: [...state.history, state.current],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        current: { ...previous, updatedAt: Date.now() }, // Update timestamp for sync
        history: newHistory,
      };
    }

    case 'RESET': {
       return {
           current: resetTournament(),
           history: [...state.history, state.current]
       }
    }

    default:
      return state;
  }
};

// --- Context ---
import { TournamentContextType } from '../types';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEY = 'tournament_state_v1';
// WebSocket server URL - change this after deploying to Fly.io
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load from local storage first
  const loadState = (): StateWithHistory => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Simple validation check
        if (parsed.players && parsed.matches) {
            return { current: parsed, history: [] };
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return initialStateWrapper;
  };

  const [stateWrapper, dispatch] = useReducer(tournamentReducer, undefined, loadState);
  const [isAdmin, setIsAdmin] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  // Track if the last state change came from WebSocket (to prevent re-broadcasting)
  const isFromWSRef = useRef(false);
  // Track latest updatedAt to avoid closure issues
  const latestUpdatedAtRef = useRef(stateWrapper.current.updatedAt);
  // Reconnection state
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Keep latestUpdatedAtRef in sync
  useEffect(() => {
    latestUpdatedAtRef.current = stateWrapper.current.updatedAt;
  }, [stateWrapper.current.updatedAt]);

  // --- WebSocket Connection ---
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Connecting to WebSocket:', WS_URL);
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_STATE') {
          const newState = data.payload as TournamentState;
          // Only update if incoming state is actually newer
          if (newState.updatedAt > latestUpdatedAtRef.current) {
            isFromWSRef.current = true;
            dispatch({ type: 'SET_STATE', payload: newState });
          }
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting in 3s...');
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  // --- Initialize WebSocket ---
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  // --- Persist & Broadcast on change ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWrapper.current));

    // Only broadcast if this change was NOT from WebSocket (prevent echo)
    if (wsRef.current?.readyState === WebSocket.OPEN && !isFromWSRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'SYNC_STATE',
        payload: stateWrapper.current
      }));
    }
    // Reset the flag after processing
    isFromWSRef.current = false;
  }, [stateWrapper.current]);


  // --- Public Methods ---

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const setLive = (matchId: string) => {
    dispatch({ type: 'SET_LIVE', payload: matchId });
  };

  const setWinner = (matchId: string, winnerId: string) => {
    dispatch({ type: 'SET_WINNER', payload: { matchId, winnerId } });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const reset = () => {
      dispatch({ type: 'RESET' });
  }

  return (
    <TournamentContext.Provider
      value={{
        state: stateWrapper.current,
        isAdmin,
        login,
        setLive,
        setWinner,
        undo,
        reset
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
