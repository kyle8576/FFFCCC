import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchCard } from './MatchCard';

interface RoundColumnProps {
  title: string;
  matchIds: string[];
  className?: string;
}

export const Bracket: React.FC = () => {
  const { state, isAdmin, setLive, setWinner } = useTournament();

  const renderMatch = (matchId: string) => {
    const match = state.matches[matchId];
    if (!match) return null;

    const playerA = match.a ? state.players[match.a] : undefined;
    const playerB = match.b ? state.players[match.b] : undefined;
    const isLive = state.liveMatchId === matchId;

    return (
      <MatchCard
        key={matchId}
        match={match}
        playerA={playerA}
        playerB={playerB}
        isLive={isLive}
        isAdmin={isAdmin}
        onSetLive={setLive}
        onSetWinner={setWinner}
      />
    );
  };

  const RoundColumn: React.FC<RoundColumnProps> = ({ title, matchIds, className }) => (
    <div className={`flex flex-col flex-1 min-w-[220px] ${className}`}>
        <h3 className="text-center text-gray-500 font-bold mb-6 uppercase tracking-wider text-sm">{title}</h3>
        <div className="flex flex-col justify-around h-full">
            {matchIds.map(id => (
                <div key={id} className="flex justify-center items-center relative">
                    {/* Visual Connectors could go here as absolute positioned lines */}
                    {renderMatch(id)}
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-row justify-between w-full h-full p-4 overflow-x-auto gap-4">
      {/* Round of 16 */}
      <RoundColumn 
        title="Round of 16" 
        matchIds={['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']} 
      />
      
      {/* Quarter Finals */}
      <RoundColumn 
        title="Quarter Finals" 
        matchIds={['m9', 'm10', 'm11', 'm12']} 
      />

      {/* Semi Finals */}
      <RoundColumn 
        title="Semi Finals" 
        matchIds={['m13', 'm14']} 
      />

      {/* Final */}
      <RoundColumn 
        title="Champion" 
        matchIds={['m15']} 
      />
    </div>
  );
};
