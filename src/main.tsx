import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'
import './mobile.css'
import './mobile-workspace.css'
import './mobile-guided.css'
import './mobile-surfaces.css'
import './mobile-chrome.css'
import './mobile-stability.css'
import './mobile-device.css'
import './mobile-mission-redesign.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
