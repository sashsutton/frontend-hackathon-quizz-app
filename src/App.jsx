import './App.css'
import {Routes, Route} from "react-router-dom"
import Navbar from './components/Navbar.jsx'
import HomePage from "./pages/HomePage.jsx";

function App() {

  return (
      <div>
          <Navbar></Navbar>
          <Routes>
              <Route path="/" element={<HomePage/>}/>
          </Routes>

      </div>
  )
}

export default App
