import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/knowledge-graph/domains - Get all domains
export async function GET() {
  try {
    const domains = await db.domain.findMany({
      include: {
        tools: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        _count: {
          select: {
            tools: true,
            reasoningMaps: true,
            sessions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

// POST /api/knowledge-graph/domains - Create new domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, color } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existingDomain = await db.domain.findUnique({
      where: { name }
    })

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain with this name already exists' },
        { status: 400 }
      )
    }

    const domain = await db.domain.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        color: color || null
      }
    })

    return NextResponse.json(domain, { status: 201 })
  } catch (error) {
    console.error('Error creating domain:', error)
    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 }
    )
  }
}