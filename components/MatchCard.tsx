import React from 'react';
import { Match, Player } from '../types';

interface MatchCardProps {
  match: Match;
  playerA?: Player;
  playerB?: Player;
  isLive: boolean;
  isAdmin: boolean;
  onSetLive?: (matchId: string) => void;
  onSetWinner?: (matchId: string, winnerId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  playerA,
  playerB,
  isLive,
  isAdmin,
  onSetLive,
  onSetWinner,
}) => {
  const isDone = match.status === 'done';
  const hasBothPlayers = !!playerA && !!playerB;
  const canSetLive = hasBothPlayers && !isDone && !isLive;

  // Handler wrappers
  const handleSetLive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin && canSetLive && onSetLive) {
      onSetLive(match.id);
    }
  };

  const handleWin = (playerId: string) => {
    if (isAdmin && !isDone && onSetWinner) {
      onSetWinner(match.id, playerId);
    }
  };

  return (
    <div
      className={`
        relative flex flex-col w-48 text-sm border rounded-md shadow-sm transition-all duration-300
        ${isLive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 z-10 bg-gray-800' : 'border-gray-700 bg-gray-800/80 hover:bg-gray-800'}
        ${isDone ? 'opacity-70' : 'opacity-100'}
      `}
    >
      {/* Header / Actions */}
      <div className="flex justify-between items-center px-3 py-1 bg-gray-900/50 rounded-t-md border-b border-gray-700 text-xs">
        <span className="text-gray-400 font-mono">{match.id}</span>
        {isLive && (
          <span className="text-amber-500 font-bold animate-pulse">● LIVE</span>
        )}
        {isAdmin && !isLive && !isDone && hasBothPlayers && (
            <button 
                onClick={handleSetLive}
                className="text-[10px] bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded text-white"
            >
                SET LIVE
            </button>
        )}
      </div>

      {/* Team A */}
      <div 
        onClick={() => playerA && handleWin(playerA.id)}
        className={`
            px-3 py-2 flex justify-between items-center cursor-pointer transition-colors
            ${match.winner === playerA?.id ? 'bg-green-900/30' : ''}
            ${isAdmin && !isDone && playerA ? 'hover:bg-gray-700' : ''}
            ${!playerA ? 'text-gray-500 italic' : 'text-gray-200'}
        `}
      >
        <span className="truncate font-medium">{playerA?.name || 'TBD'}</span>
        {match.winner === match.a && match.a && (
            <span className="text-green-400 text-xs font-bold">WIN</span>
        )}
      </div>

      <div className="h-px bg-gray-700 mx-2" />

      {/* Team B */}
      <div 
        onClick={() => playerB && handleWin(playerB.id)}
        className={`
            px-3 py-2 flex justify-between items-center cursor-pointer transition-colors rounded-b-md
            ${match.winner === playerB?.id ? 'bg-green-900/30' : ''}
            ${isAdmin && !isDone && playerB ? 'hover:bg-gray-700' : ''}
            ${!playerB ? 'text-gray-500 italic' : 'text-gray-200'}
        `}
      >
        <span className="truncate font-medium">{playerB?.name || 'TBD'}</span>
        {match.winner === match.b && match.b && (
            <span className="text-green-400 text-xs font-bold">WIN</span>
        )}
      </div>
    </div>
  );
};
