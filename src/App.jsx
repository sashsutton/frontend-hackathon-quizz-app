import './App.css'
import {Routes, Route} from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import HomePage from "./pages/HomePage.jsx";
import PlayPage from "./pages/PlayPage.jsx";
import MakePage from "./pages/MakePage.jsx";
import QuizListPage from "./pages/QuizListPage.jsx";

function App() {

  return (
      <div>
          <Navbar></Navbar>
          <Routes>
              <Route path="/" element={<HomePage/>}/>
              <Route path="/play" element={<PlayPage/>}/>
              <Route path="/make" element={<MakePage/>}/>
              <Route path="/quiz-list" element={<QuizListPage/>}/>
          </Routes>

      </div>
  )
}

export default App
