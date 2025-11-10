import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/collaboration/study-groups - Get all study groups
export async function GET(request: NextRequest) {
  try {
    // Mock data for demonstration
    const studyGroups = [
      {
        id: '1',
        name: 'Advanced Data Science',
        description: 'Master machine learning and statistical analysis',
        domain: 'Data Science',
        createdBy: 'user1',
        createdAt: Date.now() - 86400000, // 1 day ago
        members: [
          { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'student' as const, joinedAt: Date.now() },
          { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'student' as const, joinedAt: Date.now() }
        ],
        currentMembers: 2,
        maxMembers: 10,
        isPrivate: false
      },
      {
        id: '2',
        name: 'Medical Ethics Discussion',
        description: 'Explore ethical dilemmas in modern medicine',
        domain: 'Medicine',
        createdBy: 'user3',
        createdAt: Date.now() - 172800000, // 2 days ago
        members: [
          { id: 'user3', name: 'Dr. Wilson', email: 'wilson@example.com', role: 'instructor' as const, joinedAt: Date.now() }
        ],
        currentMembers: 1,
        maxMembers: 15,
        isPrivate: false,
        activeSession: {
          id: 'session1',
          scenarioId: 'scenario1',
          startedAt: Date.now() - 3600000, // 1 hour ago
          participants: ['user3']
        }
      }
    ]

    return NextResponse.json(studyGroups)
  } catch (error) {
    console.error('Error fetching study groups:', error)
    return NextResponse.json({ error: 'Failed to fetch study groups' }, { status: 500 })
  }
}

// POST /api/collaboration/study-groups - Create new study group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock creation
    const newGroup = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      domain: body.domain,
      createdBy: body.createdBy,
      createdAt: Date.now(),
      members: body.members || [],
      currentMembers: body.currentMembers || 1,
      maxMembers: body.maxMembers || 10,
      isPrivate: body.isPrivate || false
    }

    return NextResponse.json(newGroup, { status: 201 })
  } catch (error) {
    console.error('Error creating study group:', error)
    return NextResponse.json({ error: 'Failed to create study group' }, { status: 500 })
  }
}