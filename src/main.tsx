import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import './styles/teaching.css'
import './styles/interactions.css'
import './styles/slides.css'
import './styles/lessons.css'
import './styles/print.css'

/**
 * The router basename comes from Vite's BASE_URL, so the same build works
 * at a site root (Vercel, Netlify) and under a project path on GitHub
 * Pages. Deep links and refreshes resolve correctly in both because the
 * build also emits a 404.html fallback.
 */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const container = document.getElementById('root')
if (!container) throw new Error('Root element missing')

createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter basename={basename || undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
