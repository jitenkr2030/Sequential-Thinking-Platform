"use client"

import { useState, useEffect, useCallback } from 'react'
import { offlineStorage } from '@/lib/offline-storage'

export interface OfflineState {
  isOnline: boolean
  isOfflineMode: boolean
  downloadedMaps: any[]
  storageInfo: any
  syncStatus: 'synced' | 'syncing' | 'pending'
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOfflineMode: false,
    downloadedMaps: [],
    storageInfo: {},
    syncStatus: 'synced'
  })

  const [loading, setLoading] = useState(true)

  // Initialize offline state
  const initializeOffline = useCallback(async () => {
    try {
      const [downloadedMaps, storageInfo] = await Promise.all([
        offlineStorage.getAllReasoningMaps(),
        offlineStorage.getStorageInfo()
      ])

      setState(prev => ({
        ...prev,
        downloadedMaps,
        storageInfo
      }))
    } catch (error) {
      console.error('Failed to initialize offline storage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      syncOfflineData()
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initialize on mount
    initializeOffline()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [initializeOffline])

  // Download reasoning map for offline use
  const downloadReasoningMap = useCallback(async (map: any) => {
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }))
      
      await offlineStorage.saveReasoningMap(map)
      
      // Cache related content
      if (map.scenarios) {
        for (const scenario of map.scenarios) {
          await offlineStorage.cacheContent(
            `/api/sequential-thinking/${scenario.id}`,
            scenario,
            'scenario'
          )
        }
      }

      // Update state
      const downloadedMaps = await offlineStorage.getAllReasoningMaps()
      const storageInfo = await offlineStorage.getStorageInfo()
      
      setState(prev => ({
        ...prev,
        downloadedMaps,
        storageInfo,
        syncStatus: 'synced'
      }))

      return true
    } catch (error) {
      console.error('Failed to download reasoning map:', error)
      setState(prev => ({ ...prev, syncStatus: 'pending' }))
      return false
    }
  }, [])

  // Remove downloaded reasoning map
  const removeDownloadedMap = useCallback(async (mapId: string) => {
    try {
      await offlineStorage.deleteReasoningMap(mapId)
      
      // Update state
      const downloadedMaps = await offlineStorage.getAllReasoningMaps()
      const storageInfo = await offlineStorage.getStorageInfo()
      
      setState(prev => ({
        ...prev,
        downloadedMaps,
        storageInfo
      }))

      return true
    } catch (error) {
      console.error('Failed to remove downloaded map:', error)
      return false
    }
  }, [])

  // Get reasoning map (online or offline)
  const getReasoningMap = useCallback(async (mapId: string) => {
    try {
      // Try offline first
      const offlineMap = await offlineStorage.getReasoningMap(mapId)
      if (offlineMap) {
        return offlineMap
      }

      // If online and not found offline, fetch from server
      if (state.isOnline) {
        const response = await fetch(`/api/sequential-thinking/${mapId}`)
        if (response.ok) {
          const map = await response.json()
          return map
        }
      }

      return null
    } catch (error) {
      console.error('Failed to get reasoning map:', error)
      return null
    }
  }, [state.isOnline])

  // Save learning progress
  const saveProgress = useCallback(async (progress: any) => {
    try {
      if (state.isOnline) {
        // Save online and offline
        await Promise.all([
          fetch('/api/learning-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progress)
          }),
          offlineStorage.saveLearningProgress(progress)
        ])
      } else {
        // Save offline only
        await offlineStorage.saveOfflineProgress(progress)
      }
      return true
    } catch (error) {
      console.error('Failed to save progress:', error)
      return false
    }
  }, [state.isOnline])

  // Sync offline data when online
  const syncOfflineData = useCallback(async () => {
    if (!state.isOnline) return

    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }))

      // Sync offline progress
      const offlineProgress = await offlineStorage.getOfflineProgress()
      for (const progress of offlineProgress) {
        try {
          const response = await fetch('/api/learning-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progress)
          })

          if (response.ok) {
            await offlineStorage.markOfflineProgressSynced(progress.id)
          }
        } catch (error) {
          console.error('Failed to sync progress:', error)
        }
      }

      // Clear synced offline progress
      await offlineStorage.clearSyncedOfflineProgress()

      // Clear expired cache
      await offlineStorage.clearExpiredCache()

      setState(prev => ({ ...prev, syncStatus: 'synced' }))
    } catch (error) {
      console.error('Failed to sync offline data:', error)
      setState(prev => ({ ...prev, syncStatus: 'pending' }))
    }
  }, [state.isOnline])

  // Toggle offline mode
  const toggleOfflineMode = useCallback(() => {
    setState(prev => ({ ...prev, isOfflineMode: !prev.isOfflineMode }))
  }, [])

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData()
      
      // Update state
      const downloadedMaps = await offlineStorage.getAllReasoningMaps()
      const storageInfo = await offlineStorage.getStorageInfo()
      
      setState(prev => ({
        ...prev,
        downloadedMaps,
        storageInfo
      }))

      return true
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }, [])

  // Get cached content
  const getCachedContent = useCallback(async (url: string) => {
    try {
      return await offlineStorage.getCachedContent(url)
    } catch (error) {
      console.error('Failed to get cached content:', error)
      return null
    }
  }, [])

  // Cache content
  const cacheContent = useCallback(async (url: string, content: any, contentType: string) => {
    try {
      await offlineStorage.cacheContent(url, content, contentType)
      return true
    } catch (error) {
      console.error('Failed to cache content:', error)
      return false
    }
  }, [])

  // Get user preference
  const getUserPreference = useCallback(async (key: string) => {
    try {
      return await offlineStorage.getUserPreference(key)
    } catch (error) {
      console.error('Failed to get user preference:', error)
      return null
    }
  }, [])

  // Save user preference
  const saveUserPreference = useCallback(async (key: string, value: any) => {
    try {
      await offlineStorage.saveUserPreference(key, value)
      return true
    } catch (error) {
      console.error('Failed to save user preference:', error)
      return false
    }
  }, [])

  return {
    ...state,
    loading,
    downloadReasoningMap,
    removeDownloadedMap,
    getReasoningMap,
    saveProgress,
    syncOfflineData,
    toggleOfflineMode,
    clearOfflineData,
    getCachedContent,
    cacheContent,
    getUserPreference,
    saveUserPreference,
    refresh: initializeOffline
  }
}