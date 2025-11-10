"use client"

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                console.log('New content is available; please refresh.')
              }
            })
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Handle offline/online events
      const handleOnline = () => {
        console.log('App is online')
        document.body.classList.remove('offline')
      }

      const handleOffline = () => {
        console.log('App is offline')
        document.body.classList.add('offline')
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // Check initial status
      if (!navigator.onLine) {
        handleOffline()
      }

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return null
}