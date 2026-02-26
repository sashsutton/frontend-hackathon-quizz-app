import './App.css'
import { Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import HomePage from "./pages/HomePage.jsx";
import QuizListPage from "./pages/QuizListPage.jsx";
import PlayPage from "./pages/PlayPage.jsx";
import MakePage from "./pages/MakePage.jsx";
import ProtectedRoute from './components/ProtectedRoute';
import PlaySoloGamePage from "./pages/PlaySoloGamePage.jsx";
import QuizDetailsPage from "./pages/quizDetails.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import DuelLobbyPage from "./pages/DuelLobbyPage.jsx";
import PlayDuelPage from "./pages/PlayDuelPage.jsx";
import DuelResultPage from "./pages/DuelResultPage.jsx";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/play" element={
          <ProtectedRoute><PlayPage /></ProtectedRoute>
        } />

        <Route path="/play/:id" element={
          <ProtectedRoute><PlaySoloGamePage /></ProtectedRoute>
        } />

        <Route path="/quiz-list" element={<QuizListPage />} />
        <Route path="/quiz-details/:id" element={<QuizDetailsPage />} />

        <Route path="/make" element={
          <ProtectedRoute><MakePage /></ProtectedRoute>
        } />

        {/* Profile & Leaderboard */}
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Duels */}
        <Route path="/duel" element={
          <ProtectedRoute><DuelLobbyPage /></ProtectedRoute>
        } />
        <Route path="/duel/play/:duelId" element={
          <ProtectedRoute><PlayDuelPage /></ProtectedRoute>
        } />
        <Route path="/duel/result/:duelId" element={
          <ProtectedRoute><DuelResultPage /></ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App