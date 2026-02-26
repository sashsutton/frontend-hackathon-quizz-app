import './App.css'
import {Routes, Route} from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import HomePage from "./pages/HomePage.jsx";

import PlayPage from "./pages/PlayPage.jsx";
import MakePage from "./pages/MakePage.jsx";
import QuizListPage from "./pages/QuizListPage.jsx";
import ProtectedRoute from './components/ProtectedRoute';
<<<<<<< HEAD
import QuizList from './pages/MockQuizLisPage.jsx';
=======
import QuizPage from './pages/QuizPage.jsx';
<<<<<<< HEAD
>>>>>>> b7e65b7ed42ac86b7b05b4a003c0c2fbb95069ca
=======
import PlaySoloGamePage from './pages/PlaySoloGamePage.jsx';
>>>>>>> 77f0be4 (Quiz en solo, implémentation de la partie (avec des questions placeholder))

function App() {

  return (
      <div>
          <Navbar/>
          <Routes>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/play" element={
                <ProtectedRoute>
                  <PlayPage/>
                </ProtectedRoute>
              }/>
              <Route path="/play/:id" element={<PlaySoloPage />} />
              <Route path="/quiz-details/:id" element={<QuizDetailsPage />} />
              <Route path="/make" element={
                <ProtectedRoute>
                  <MakePage/>
                </ProtectedRoute>
              }/>
<<<<<<< HEAD
              <Route path="/quiz-list" element={<QuizList/>}/>
=======
              <Route path="/quiz-list" element={<QuizListPage/>}/>
              <Route path="/quiz-list/:quizId" element={<QuizPage/>}/>
<<<<<<< HEAD
>>>>>>> b7e65b7ed42ac86b7b05b4a003c0c2fbb95069ca
=======

              <Route path="/play-solo/:quizId" element={<PlaySoloGamePage/>}/>
>>>>>>> 77f0be4 (Quiz en solo, implémentation de la partie (avec des questions placeholder))
          </Routes>

      </div>
  )
}

export default App
