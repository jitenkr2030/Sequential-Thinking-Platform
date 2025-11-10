import { NextRequest, NextResponse } from 'next/server'

// GET /api/collaboration/peer-reviews/[userId] - Get peer reviews for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    // Mock peer reviews data
    const peerReviews = [
      {
        id: '1',
        requesterId: userId,
        reviewerId: 'reviewer1',
        reasoningId: 'reasoning1',
        content: 'Please review my logical reasoning approach',
        domain: 'Data Science',
        status: 'completed' as const,
        requestedAt: Date.now() - 86400000,
        reviewedAt: Date.now() - 43200000,
        rating: 4,
        feedback: 'Good logical flow, but could improve on evidence usage.',
        criteria: {
          logicalFlow: 4,
          evidenceUse: 3,
          conclusionQuality: 4,
          toolApplication: 5
        }
      },
      {
        id: '2',
        requesterId: userId,
        reasoningId: 'reasoning2',
        content: 'Review my medical case analysis',
        domain: 'Medicine',
        status: 'pending' as const,
        requestedAt: Date.now() - 3600000
      }
    ]

    return NextResponse.json(peerReviews)
  } catch (error) {
    console.error('Error fetching peer reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch peer reviews' }, { status: 500 })
  }
}

// POST /api/collaboration/peer-reviews - Request a peer review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reasoningId, domain, content } = body
    
    // Mock peer review creation
    const newReview = {
      id: Date.now().toString(),
      requesterId: 'current-user',
      reasoningId,
      content,
      domain,
      status: 'pending' as const,
      requestedAt: Date.now()
    }

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error('Error creating peer review:', error)
    return NextResponse.json({ error: 'Failed to create peer review' }, { status: 500 })
  }
}