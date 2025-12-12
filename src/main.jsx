import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserProvider} from './contest/browser-context.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserProvider>
      <App />
    </BrowserProvider>
  </StrictMode>,
)
