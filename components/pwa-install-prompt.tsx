'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed') === '1'

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      if (!dismissed) {
        setVisible(true)
      }
    }

    const handleAppInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setVisible(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setVisible(false)
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="border-slate-700/60 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-600/20 p-2 text-blue-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Install OASIS App</p>
              <p className="mt-1 text-xs text-slate-400">
                Save this app to your device for a faster, full-screen experience.
              </p>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleInstall} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  Not now
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
