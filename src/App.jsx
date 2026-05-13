import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ExercisesPage from './pages/ExercisesPage';
import LevelSelector from './pages/LevelSelector';
import ErrorReview from './pages/ErrorReview';
import Leaderboard from './pages/Leaderboard';
import Games from './pages/Games';
import Profile from './pages/Profile';
import SprechenSchreiben from './pages/SprechenSchreiben';
import ParticipialPage from './pages/ParticipialPage'
import PassiveGame from './pages/PassiveGame';


function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="levels" element={<LevelSelector />} />
          <Route path="errors" element={<ErrorReview />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="games" element={<Games />} />
          <Route path="profile" element={<Profile />} />
          <Route path="sprechen-schreiben" element={<SprechenSchreiben />} />
          <Route path="participial" element={<ParticipialPage />} />
          <Route path="passive-game" element={<PassiveGame />} />

        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;