"use client"

import { useState, useEffect, useCallback } from 'react'
import { notificationManager } from '@/lib/notification-manager'

export interface NotificationPreferences {
  learningReminders: boolean
  progressUpdates: boolean
  achievements: boolean
  streaks: boolean
  collaborative: boolean
  dailyDigest: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface NotificationState {
  permission: NotificationPermission
  pushSupported: boolean
  notificationsEnabled: boolean
  preferences: NotificationPreferences
  loading: boolean
}

const defaultPreferences: NotificationPreferences = {
  learningReminders: true,
  progressUpdates: true,
  achievements: true,
  streaks: true,
  collaborative: true,
  dailyDigest: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  frequency: 'immediate'
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    pushSupported: false,
    notificationsEnabled: false,
    preferences: defaultPreferences,
    loading: true
  })

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    try {
      const permission = notificationManager.getPermissionStatus()
      const pushSupported = notificationManager.isPushSupported()
      const notificationsEnabled = notificationManager.areNotificationsEnabled()
      
      // Load preferences from localStorage
      const savedPreferences = localStorage.getItem('notificationPreferences')
      const preferences = savedPreferences 
        ? { ...defaultPreferences, ...JSON.parse(savedPreferences) }
        : defaultPreferences

      setState({
        permission,
        pushSupported,
        notificationsEnabled,
        preferences,
        loading: false
      })
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const granted = await notificationManager.requestPermission()
      
      if (granted) {
        const subscribed = await notificationManager.subscribeToPush()
        
        setState(prev => ({
          ...prev,
          permission: 'granted',
          notificationsEnabled: subscribed,
          loading: false
        }))
        
        return true
      } else {
        setState(prev => ({
          ...prev,
          permission: 'denied',
          loading: false
        }))
        
        return false
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      setState(prev => ({ ...prev, loading: false }))
      return false
    }
  }, [])

  // Toggle notifications
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      if (enabled) {
        const subscribed = await notificationManager.subscribeToPush()
        setState(prev => ({
          ...prev,
          notificationsEnabled: subscribed,
          loading: false
        }))
      } else {
        const unsubscribed = await notificationManager.unsubscribeFromPush()
        setState(prev => ({
          ...prev,
          notificationsEnabled: !unsubscribed,
          loading: false
        }))
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = { ...state.preferences, ...newPreferences }
      
      // Save to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences))
      
      setState(prev => ({
        ...prev,
        preferences: updatedPreferences
      }))
      
      // Sync with server if online
      if (navigator.onLine) {
        await fetch('/api/notifications/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPreferences),
        })
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    }
  }, [state.preferences])

  // Schedule learning reminder
  const scheduleLearningReminder = useCallback(async (time: Date, message: string) => {
    if (!state.preferences.learningReminders) return false
    
    // Check quiet hours
    if (state.preferences.quietHours.enabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const { start, end } = state.preferences.quietHours
      
      if (isTimeInRange(currentTime, start, end)) {
        console.log('Notification suppressed due to quiet hours')
        return false
      }
    }
    
    return await notificationManager.scheduleLearningReminder(time, message)
  }, [state.preferences])

  // Send progress update
  const sendProgressUpdate = useCallback(async (progress: any) => {
    if (!state.preferences.progressUpdates) return false
    
    return await notificationManager.sendProgressUpdate(progress)
  }, [state.preferences.progressUpdates])

  // Send achievement notification
  const sendAchievementNotification = useCallback(async (achievement: any) => {
    if (!state.preferences.achievements) return false
    
    return await notificationManager.sendAchievementNotification(achievement)
  }, [state.preferences.achievements])

  // Send streak notification
  const sendStreakNotification = useCallback(async (days: number) => {
    if (!state.preferences.streaks) return false
    
    return await notificationManager.sendStreakNotification(days)
  }, [state.preferences.streaks])

  // Send collaborative notification
  const sendCollaborativeNotification = useCallback(async (message: string, collaborator: string) => {
    if (!state.preferences.collaborative) return false
    
    return await notificationManager.sendCollaborativeNotification(message, collaborator)
  }, [state.preferences.collaborative])

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    return await notificationManager.sendTestNotification()
  }, [])

  // Check if notifications should be sent (based on preferences and quiet hours)
  const shouldSendNotification = useCallback(() => {
    if (!state.preferences.quietHours.enabled) return true
    
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const { start, end } = state.preferences.quietHours
    
    return !isTimeInRange(currentTime, start, end)
  }, [state.preferences])

  // Initialize on mount
  useEffect(() => {
    initializeNotifications()
  }, [initializeNotifications])

  // Listen for permission changes
  useEffect(() => {
    const handlePermissionChange = () => {
      const permission = notificationManager.getPermissionStatus()
      setState(prev => ({ ...prev, permission }))
    }

    if ('Notification' in window) {
      // This is a bit of a hack since there's no direct event for permission changes
      const interval = setInterval(handlePermissionChange, 1000)
      
      return () => clearInterval(interval)
    }
  }, [])

  return {
    ...state,
    requestPermission,
    toggleNotifications,
    updatePreferences,
    scheduleLearningReminder,
    sendProgressUpdate,
    sendAchievementNotification,
    sendStreakNotification,
    sendCollaborativeNotification,
    sendTestNotification,
    shouldSendNotification,
    refresh: initializeNotifications
  }
}

// Helper function to check if time is in range
function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeToMinutes = (t: string) => {
    const [hours, minutes] = t.split(':').map(Number)
    return hours * 60 + minutes
  }
  
  const currentMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  
  // Handle overnight range (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }
  
  // Normal range
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}