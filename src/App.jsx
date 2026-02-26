import './App.css'
import {Routes, Route} from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import HomePage from "./pages/HomePage.jsx";

import PlayPage from "./pages/PlayPage.jsx";
import MakePage from "./pages/MakePage.jsx";
import QuizListPage from "./pages/QuizListPage.jsx";
import ProtectedRoute from './components/ProtectedRoute';
import QuizList from './pages/MockQuizLisPage.jsx';

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
              <Route path="/quiz-list" element={<QuizList/>}/>
          </Routes>

      </div>
  )
}

export default App
