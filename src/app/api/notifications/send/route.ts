import { NextRequest, NextResponse } from 'next/server'

// In a real application, you would store subscriptions in a database
// For this example, we'll use in-memory storage
const subscriptions = new Map<string, any>()

// VAPID keys should be stored securely and not in code
// These are example keys - in production, generate your own
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = 'mailto:notifications@sequential-thinking.com'

export async function POST(request: NextRequest) {
  try {
    const { title, message, type, data } = await request.json()
    
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    // In a real application, you would use a proper push service
    // For this example, we'll simulate sending notifications
    
    const notificationPayload = {
      title,
      body: message,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/badge-72x72.svg',
      tag: type || 'general',
      data: data || {},
      timestamp: Date.now()
    }

    // Send to all subscribed clients
    let sentCount = 0
    for (const [endpoint, subscriptionData] of subscriptions.entries()) {
      try {
        // In a real app, you would use web-push library here
        // await webpush.sendNotification(subscriptionData.subscription, JSON.stringify(notificationPayload))
        
        console.log(`Notification sent to ${endpoint}:`, title)
        sentCount++
      } catch (error) {
        console.error(`Failed to send notification to ${endpoint}:`, error)
        
        // Remove failed subscriptions
        subscriptions.delete(endpoint)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Notification sent to ${sentCount} subscribers`,
      sentCount,
      totalSubscribers: subscriptions.size
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// Helper function to send specific types of notifications
export async function sendLearningReminder(time: Date, message: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Learning Reminder',
      message,
      type: 'learning-reminder',
      data: { url: '/?mode=self-study', scheduledTime: time.toISOString() }
    }),
  })

  return response.json()
}

export async function sendProgressUpdate(progress: any) {
  const { completedSteps, totalSteps, domain } = progress
  const percentage = Math.round((completedSteps / totalSteps) * 100)
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Progress Update',
      message: `You've completed ${percentage}% of your ${domain} learning path!`,
      type: 'progress-update',
      data: { 
        url: '/?mode=analytics',
        progress: { completedSteps, totalSteps, domain, percentage }
      }
    }),
  })

  return response.json()
}

export async function sendAchievementNotification(achievement: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Achievement Unlocked!',
      message: `Congratulations! You've earned: ${achievement.title}`,
      type: 'achievement',
      data: { 
        url: '/?mode=analytics',
        achievement
      }
    }),
  })

  return response.json()
}

export async function sendStreakNotification(days: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Learning Streak!',
      message: `Amazing! You've been learning for ${days} consecutive days!`,
      type: 'streak',
      data: { 
        url: '/?mode=self-study',
        streakDays: days
      }
    }),
  })

  return response.json()
}