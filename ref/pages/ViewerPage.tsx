import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Bracket } from '../components/Bracket';
import { useNavigate } from 'react-router-dom';

const ViewerPage: React.FC = () => {
  const { state } = useTournament();
  const navigate = useNavigate();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');

  const liveMatch = state.liveMatchId ? state.matches[state.liveMatchId] : null;
  const livePlayerA = liveMatch?.a ? state.players[liveMatch.a] : null;
  const livePlayerB = liveMatch?.b ? state.players[liveMatch.b] : null;

  const handleAdminAccess = () => {
    // Simple query param redirect hack to pass password, or just redirect to admin which has its own lock
    // For this flow, let's just go to admin page, it handles login
    navigate('/admin');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-md z-20">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span className="text-amber-500">🏆</span> TOURNAMENT
        </h1>
        <button 
          onClick={handleAdminAccess}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          Admin Login
        </button>
      </header>

      {/* Live Banner */}
      <div className={`
        w-full p-4 text-center transition-all duration-500
        ${liveMatch ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-amber-900/30' : 'bg-gray-900 border-b border-gray-800'}
      `}>
        {liveMatch && livePlayerA && livePlayerB ? (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="text-amber-500 font-bold tracking-[0.2em] text-xs mb-1 uppercase animate-pulse">
                    Currently Live • {liveMatch.round} • Match {liveMatch.id}
                </div>
                <div className="text-2xl md:text-4xl font-black flex items-center gap-4">
                    <span className="text-white">{livePlayerA.name}</span>
                    <span className="text-gray-600 text-lg font-light">VS</span>
                    <span className="text-white">{livePlayerB.name}</span>
                </div>
            </div>
        ) : (
            <div className="text-gray-600 italic">Waiting for next match...</div>
        )}
      </div>

      {/* Bracket Area */}
      <main className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="min-w-[1000px] h-full">
             <Bracket />
        </div>
      </main>
    </div>
  );
};

export default ViewerPage;
