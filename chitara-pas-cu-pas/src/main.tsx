import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SettingsProvider } from './store/settings'
import { ProgressProvider } from './store/progress'
import { ToastProvider } from './store/toast'
import { installAudioUnlock } from './audio/context'

installAudioUnlock()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
)

// Service worker (doar în build-ul de producție): aplicația merge offline și se poate instala pe telefon
if ('serviceWorker' in navigator && import.meta.env.PROD && import.meta.env.MODE !== 'single') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
