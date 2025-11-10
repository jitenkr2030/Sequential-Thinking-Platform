import { NextRequest, NextResponse } from 'next/server'

// In a real application, you would store subscriptions in a database
// For this example, we'll use in-memory storage
const subscriptions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { subscription, userAgent } = await request.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Store the subscription
    subscriptions.set(subscription.endpoint, {
      subscription,
      userAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    console.log('New push subscription:', subscription.endpoint)

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return subscription count for admin purposes
    return NextResponse.json({ 
      count: subscriptions.size,
      endpoints: Array.from(subscriptions.keys())
    })
  } catch (error) {
    console.error('Error getting subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    )
  }
}