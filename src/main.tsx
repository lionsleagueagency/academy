import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Hide PWA splash screen after app mounts
setTimeout(() => {
  const splash = document.getElementById('pwa-splash')
  if (splash) {
    splash.classList.add('hide')
    setTimeout(() => splash.remove(), 300)
  }
}, 500)

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed - app still works
    })
  })
}

// Install prompt handler
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // Dispatch custom event so components can react
  window.dispatchEvent(new CustomEvent('pwa-install-available', { detail: deferredPrompt }))
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  window.dispatchEvent(new CustomEvent('pwa-installed'))
})

export function getInstallPrompt() {
  return deferredPrompt
}

export async function installPWA() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome === 'accepted'
}
