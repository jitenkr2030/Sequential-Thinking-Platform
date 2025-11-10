import { NextRequest, NextResponse } from 'next/server'

// POST /api/collaboration/forum/[postId]/replies - Create a forum reply
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId
    const body = await request.json()
    const { content } = body
    
    // Mock reply creation
    const newReply = {
      id: Date.now().toString(),
      postId,
      authorId: 'current-user',
      authorName: 'Current User',
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: 0,
      isAccepted: false
    }

    return NextResponse.json(newReply, { status: 201 })
  } catch (error) {
    console.error('Error creating forum reply:', error)
    return NextResponse.json({ error: 'Failed to create forum reply' }, { status: 500 })
  }
}