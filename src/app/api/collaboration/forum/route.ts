import { NextRequest, NextResponse } from 'next/server'

// GET /api/collaboration/forum - Get forum posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    // Mock forum posts data
    const forumPosts = [
      {
        id: '1',
        title: 'How to approach logical reasoning in Data Science?',
        content: 'I\'m struggling with applying logical reasoning to data science problems. Can someone share their approach and methodology?',
        authorId: 'user1',
        authorName: 'John Doe',
        domain: 'Data Science',
        tags: ['help', 'logical-reasoning', 'data-science'],
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 43200000, // 12 hours ago
        isPinned: false,
        isLocked: false,
        views: 45,
        likes: 12,
        replies: [
          {
            id: '1',
            postId: '1',
            authorId: 'user2',
            authorName: 'Jane Smith',
            content: 'I recommend starting with clear problem definition, then breaking it down into smaller components...',
            createdAt: Date.now() - 3600000, // 1 hour ago
            updatedAt: Date.now() - 3600000,
            likes: 5,
            isAccepted: false
          }
        ]
      },
      {
        id: '2',
        title: 'Medical Ethics: Patient Autonomy vs. Beneficence',
        content: 'Discussion on the ethical dilemma between respecting patient autonomy and acting in their best interest when they refuse treatment.',
        authorId: 'user3',
        authorName: 'Dr. Wilson',
        domain: 'Medicine',
        tags: ['ethics', 'patient-care', 'dilemma'],
        createdAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 86400000, // 1 day ago
        isPinned: true,
        isLocked: false,
        views: 120,
        likes: 25,
        replies: [
          {
            id: '2',
            postId: '2',
            authorId: 'user4',
            authorName: 'Sarah Johnson',
            content: 'This is a classic dilemma. The key is to ensure the patient has all the information needed to make an informed decision...',
            createdAt: Date.now() - 7200000, // 2 hours ago
            updatedAt: Date.now() - 7200000,
            likes: 8,
            isAccepted: true
          }
        ]
      }
    ]

    // Filter by domain if specified
    const filteredPosts = domain 
      ? forumPosts.filter(post => post.domain === domain)
      : forumPosts

    return NextResponse.json({ posts: filteredPosts })
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return NextResponse.json({ error: 'Failed to fetch forum posts' }, { status: 500 })
  }
}

// POST /api/collaboration/forum - Create a new forum post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock post creation
    const newPost = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      authorId: body.authorId,
      authorName: body.authorName,
      domain: body.domain,
      tags: body.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isLocked: false,
      views: 0,
      likes: 0,
      replies: []
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating forum post:', error)
    return NextResponse.json({ error: 'Failed to create forum post' }, { status: 500 })
  }
}