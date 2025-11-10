import { NextRequest, NextResponse } from 'next/server'

// POST /api/collaboration/peer-reviews/[reviewId]/submit - Submit a peer review
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId
    const body = await request.json()
    const { rating, feedback, criteria } = body
    
    // Mock review submission
    const submittedReview = {
      id: reviewId,
      rating,
      feedback,
      criteria: criteria || {
        logicalFlow: rating,
        evidenceUse: rating,
        conclusionQuality: rating,
        toolApplication: rating
      },
      status: 'completed' as const,
      reviewedAt: Date.now()
    }

    return NextResponse.json(submittedReview)
  } catch (error) {
    console.error('Error submitting peer review:', error)
    return NextResponse.json({ error: 'Failed to submit peer review' }, { status: 500 })
  }
}