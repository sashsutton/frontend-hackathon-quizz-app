import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BrowsersRouter from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowsersRouter>
          <App />
      </BrowsersRouter>
  </StrictMode>,
)
