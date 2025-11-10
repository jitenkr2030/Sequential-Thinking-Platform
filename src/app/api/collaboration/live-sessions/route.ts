import { NextRequest, NextResponse } from 'next/server'

// GET /api/collaboration/live-sessions - Get all live sessions
export async function GET(request: NextRequest) {
  try {
    // Mock live sessions data
    const liveSessions = [
      {
        id: '1',
        instructorId: 'instructor1',
        title: 'Introduction to Machine Learning',
        description: 'Learn the fundamentals of ML and its applications',
        domain: 'Data Science',
        scheduledAt: Date.now() + 3600000, // 1 hour from now
        duration: 90,
        status: 'scheduled' as const,
        participants: [
          { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'student' as const, joinedAt: Date.now() }
        ],
        maxParticipants: 50,
        recording: false,
        whiteboard: {
          enabled: true,
          data: null
        }
      },
      {
        id: '2',
        instructorId: 'instructor2',
        title: 'Medical Ethics Case Study',
        description: 'Real-world ethical dilemmas in healthcare',
        domain: 'Medicine',
        scheduledAt: Date.now() - 1800000, // 30 minutes ago
        duration: 60,
        status: 'live' as const,
        participants: [
          { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'student' as const, joinedAt: Date.now() }
        ],
        maxParticipants: 30,
        recording: true,
        whiteboard: {
          enabled: true,
          data: null
        }
      }
    ]

    return NextResponse.json(liveSessions)
  } catch (error) {
    console.error('Error fetching live sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch live sessions' }, { status: 500 })
  }
}

// POST /api/collaboration/live-sessions - Create a new live session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock session creation
    const newSession = {
      id: Date.now().toString(),
      instructorId: body.instructorId,
      title: body.title,
      description: body.description,
      domain: body.domain,
      scheduledAt: body.scheduledAt,
      duration: body.duration,
      status: 'scheduled' as const,
      participants: [],
      maxParticipants: body.maxParticipants,
      recording: false,
      whiteboard: {
        enabled: false,
        data: null
      }
    }

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error creating live session:', error)
    return NextResponse.json({ error: 'Failed to create live session' }, { status: 500 })
  }
}