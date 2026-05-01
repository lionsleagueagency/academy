import { useState, useEffect } from 'react'
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { installPWA } from '../main'

export function PWAInstallBanner() {
  const [showInstall, setShowInstall] = useState(false)
  const [showOffline, setShowOffline] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleInstallAvailable = () => setShowInstall(true)
    const handleInstalled = () => setShowInstall(false)

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', handleInstalled)

    // Check online status
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    const accepted = await installPWA()
    if (accepted) setShowInstall(false)
  }

  return (
    <>
      {/* Offline Banner */}
      {showOffline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff size={16} />
          <span>Você está offline. Algumas funcionalidades podem estar indisponíveis.</span>
          <button onClick={() => setShowOffline(false)} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Install Banner */}
      {showInstall && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-sm z-[60] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Download size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Instalar App</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Instale o Lions League Academy para acesso rápido e uso offline.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Instalar
                </button>
                <button
                  onClick={() => setShowInstall(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Agora não
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstall(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
      <WifiOff size={16} />
      <span>Você está offline</span>
    </div>
  )
}
