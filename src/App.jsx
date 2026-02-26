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
import MockQuizList from './pages/MockQuizLisPage.jsx';
import QuizPage from "./pages/QuizPage.jsx";
import Quizdetails from "./pages/quizDetails.jsx";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/play" element={
          <ProtectedRoute>
            <PlayPage />
          </ProtectedRoute>
        } />

        <Route path="/play/:id" element={
          <ProtectedRoute>
            <PlaySoloGamePage />
          </ProtectedRoute>
        } />

        <Route path="/quiz-list" element={<QuizListPage />} />

        <Route path="/quiz-details/:id" element={<Quizdetails />} />

        <Route path="/make" element={
          <ProtectedRoute>
            <MakePage />
          </ProtectedRoute>
        } />

        <Route path="/mock-list" element={<MockQuizList />} />
      </Routes>
    </div>
  )
}

export default App