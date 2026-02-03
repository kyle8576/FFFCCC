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
       <header className="bg-gray-800 border-b border-amber-900/50 p-4 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">
            🔧 Tournament Control
            </h1>
            <span className="text-xs bg-amber-900/50 text-amber-500 px-2 py-1 rounded border border-amber-900">
                ADMIN MODE
            </span>
        </div>
        
        <div className="flex gap-2">
            <button
                onClick={undo}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 border border-gray-600 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                Undo Last Action
            </button>
             <button
                onClick={() => { if(confirm('Reset entire tournament?')) reset(); }}
                className="px-4 py-2 bg-red-900/50 text-red-200 rounded hover:bg-red-900 border border-red-900/50"
            >
                Reset
            </button>
            <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-400 hover:text-white"
            >
                View as Public
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
