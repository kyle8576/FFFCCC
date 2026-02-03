import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import ViewerPage from './pages/ViewerPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <TournamentProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ViewerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </TournamentProvider>
  );
};

export default App;