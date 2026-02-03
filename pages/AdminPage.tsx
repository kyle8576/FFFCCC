import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Bracket } from '../components/Bracket';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { login, isAdmin, undo, reset } = useTournament();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // If not logged in, show login screen
  if (!isAdmin) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (login(password)) {
        setError(false);
      } else {
        setError(true);
      }
    };

    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-3xl font-bold text-center text-white">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 text-white bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-amber-500"
                placeholder="Enter password (admin)"
              />
            </div>
            {error && <p className="text-red-500 text-sm">Incorrect password. Try 'admin'.</p>}
            <button
              type="submit"
              className="w-full py-2 font-bold text-gray-900 bg-amber-500 rounded hover:bg-amber-400 transition-colors"
            >
              Enter Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-400"
            >
              Back to Viewer
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="flex flex-col h-full bg-gray-950">
       <header className="bg-gray-800 border-b border-amber-900/50 p-4 sm:p-8 flex flex-wrap justify-between items-center gap-3 shadow-md z-20">
        <div className="flex items-center gap-3 sm:gap-5">
            <h1 className="text-lg sm:text-2xl font-bold text-white">
            🔧 <span className="hidden sm:inline">Tournament Control</span><span className="sm:hidden">Control</span>
            </h1>
            <span className="text-sm sm:text-base bg-amber-900/50 text-amber-500 px-3 py-2 rounded border border-amber-900">
                ADMIN
            </span>
        </div>

        <div className="flex flex-nowrap gap-2 sm:gap-3 shrink-0">
            <button
                onClick={undo}
                className="shrink-0 px-3 py-2 sm:py-3 text-sm sm:text-base bg-gray-700 text-white rounded hover:bg-gray-600 border border-gray-600 flex items-center justify-center gap-1 whitespace-nowrap"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                <span className="hidden sm:inline">Undo</span>
            </button>
             <button
                onClick={() => { if(confirm('Reset entire tournament?')) reset(); }}
                className="shrink-0 px-3 py-2 sm:py-3 text-sm sm:text-base bg-red-900/50 text-red-200 rounded hover:bg-red-900 border border-red-900/50 text-center whitespace-nowrap"
            >
                Reset
            </button>
            <button
                onClick={() => navigate('/')}
                className="shrink-0 px-3 py-2 sm:py-3 text-sm sm:text-base text-gray-400 hover:text-white whitespace-nowrap"
            >
                <span className="hidden sm:inline">View as Public</span><span className="sm:hidden">Public</span>
            </button>
        </div>
      </header>

      <div className="bg-amber-900/20 text-amber-200 text-xs text-center py-1">
          Select a match to SET LIVE. Click a player name to DECLARE WINNER.
      </div>

      <main className="flex-1 overflow-auto bg-gray-900">
         <div className="min-w-[1000px] h-full">
            <Bracket />
         </div>
      </main>
    </div>
  );
};

export default AdminPage;
