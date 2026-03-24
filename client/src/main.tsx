// client/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import GoogleTag from './GoogleTag'  // <-- added import

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleTag />   {/* <-- added GoogleTag mount (loads gtag once for the whole SPA) */}
    <App />
  </StrictMode>,
)
