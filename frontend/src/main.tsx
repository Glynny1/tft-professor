import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// For GitHub Pages deployment:
import { HashRouter as BrowserRouter } from 'react-router-dom'
// For Vercel/Netlify, use BrowserRouter:
// import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
