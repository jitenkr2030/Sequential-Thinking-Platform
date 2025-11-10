import { NextRequest, NextResponse } from 'next/server'

// In a real application, you would store preferences in a database
// For this example, we'll use in-memory storage
const userPreferences = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const preferences = await request.json()
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'Invalid preferences data' },
        { status: 400 }
      )
    }

    // In a real app, you would get the user ID from authentication
    const userId = 'demo-user' // This would come from auth
    
    // Store the preferences
    userPreferences.set(userId, {
      ...preferences,
      updatedAt: new Date().toISOString()
    })

    console.log('Updated notification preferences for user:', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved successfully' 
    })
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would get the user ID from authentication
    const userId = 'demo-user' // This would come from auth
    
    const preferences = userPreferences.get(userId)
    
    if (!preferences) {
      // Return default preferences if none exist
      const defaultPreferences = {
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
      
      return NextResponse.json(defaultPreferences)
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error getting preferences:', error)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}