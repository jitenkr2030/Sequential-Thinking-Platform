// Push notification manager for Sequential Thinking Platform
export class NotificationManager {
  private static instance: NotificationManager
  private permission: NotificationPermission = 'default'
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  private constructor() {
    this.initialize()
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private async initialize() {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }

    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    return false
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<boolean> {
    if (!this.registration) {
      console.error('Service worker not registered')
      return false
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      this.subscription = subscription
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return true
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return false
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      await this.subscription.unsubscribe()
      this.subscription = null
      
      // Remove subscription from server
      await this.removeSubscriptionFromServer()
      
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer() {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server')
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  // Show local notification
  async showNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!('Notification' in window) || this.permission !== 'granted') {
      return false
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/badge-72x72.svg',
        tag: 'sequential-thinking',
        renotify: true,
        requireInteraction: false,
        ...options
      }

      const notification = new Notification(title, defaultOptions)
      
      // Handle notification click
      notification.onclick = () => {
        notification.close()
        if (options.data?.url) {
          window.open(options.data.url, '_blank')
        }
      }

      return true
    } catch (error) {
      console.error('Failed to show notification:', error)
      return false
    }
  }

  // Schedule learning reminder
  async scheduleLearningReminder(time: Date, message: string): Promise<boolean> {
    // For now, we'll use a simple timeout-based approach
    // In a real application, you'd use a more robust scheduling system
    const delay = time.getTime() - Date.now()
    
    if (delay > 0) {
      setTimeout(async () => {
        await this.showNotification('Learning Reminder', {
          body: message,
          data: { url: '/?mode=self-study' },
          actions: [
            {
              action: 'start-learning',
              title: 'Start Learning',
              icon: '/icons/study-icon.svg'
            },
            {
              action: 'snooze',
              title: 'Snooze',
              icon: '/icons/close-icon.svg'
            }
          ]
        })
      }, delay)
    }

    return true
  }

  // Schedule progress update
  async sendProgressUpdate(progress: any): Promise<boolean> {
    const { completedSteps, totalSteps, domain } = progress
    const percentage = Math.round((completedSteps / totalSteps) * 100)
    
    return await this.showNotification('Progress Update', {
      body: `You've completed ${percentage}% of your ${domain} learning path!`,
      data: { url: '/?mode=analytics' },
      badge: '/icons/analytics-icon.svg'
    })
  }

  // Send achievement notification
  async sendAchievementNotification(achievement: any): Promise<boolean> {
    return await this.showNotification('Achievement Unlocked!', {
      body: `Congratulations! You've earned: ${achievement.title}`,
      data: { url: '/?mode=analytics' },
      badge: '/icons/analytics-icon.svg'
    })
  }

  // Send learning streak notification
  async sendStreakNotification(days: number): Promise<boolean> {
    return await this.showNotification('Learning Streak!', {
      body: `Amazing! You've been learning for ${days} consecutive days!`,
      data: { url: '/?mode=self-study' },
      badge: '/icons/study-icon.svg'
    })
  }

  // Send collaborative learning notification
  async sendCollaborativeNotification(message: string, collaborator: string): Promise<boolean> {
    return await this.showNotification('Collaborative Learning', {
      body: `${collaborator}: ${message}`,
      data: { url: '/?mode=teaching' },
      badge: '/icons/study-icon.svg'
    })
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Check if notifications are enabled
  areNotificationsEnabled(): boolean {
    return this.permission === 'granted' && this.subscription !== null
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Test notification
  async sendTestNotification(): Promise<boolean> {
    return await this.showNotification('Test Notification', {
      body: 'This is a test notification from Sequential Thinking Platform',
      data: { url: '/' },
      actions: [
        {
          action: 'test',
          title: 'Test Action',
          icon: '/icons/explore-icon.svg'
        }
      ]
    })
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()