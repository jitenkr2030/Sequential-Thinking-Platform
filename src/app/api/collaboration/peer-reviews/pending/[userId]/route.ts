import { NextRequest, NextResponse } from 'next/server'

// GET /api/collaboration/peer-reviews/pending/[userId] - Get pending peer reviews for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    
    // Mock pending peer reviews
    const pendingReviews = [
      {
        id: '1',
        requesterId: 'user1',
        reviewerId: userId,
        reasoningId: 'reasoning1',
        content: 'Please review my logical reasoning approach for this data science problem',
        domain: 'Data Science',
        status: 'pending' as const,
        requestedAt: Date.now() - 7200000 // 2 hours ago
      },
      {
        id: '2',
        requesterId: 'user2',
        reviewerId: userId,
        reasoningId: 'reasoning2',
        content: 'Review my medical case analysis and provide feedback',
        domain: 'Medicine',
        status: 'pending' as const,
        requestedAt: Date.now() - 1800000 // 30 minutes ago
      }
    ]

    return NextResponse.json(pendingReviews)
  } catch (error) {
    console.error('Error fetching pending peer reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch pending peer reviews' }, { status: 500 })
  }
}