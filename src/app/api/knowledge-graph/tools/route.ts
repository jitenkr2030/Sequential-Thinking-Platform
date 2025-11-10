import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/knowledge-graph/tools - Get all tools or search tools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const domain = searchParams.get('domain')
    const category = searchParams.get('category')

    const where: any = {}
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }
    
    if (domain) {
      where.domain = { name: { contains: domain, mode: 'insensitive' } }
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    const tools = await db.tool.findMany({
      where,
      include: {
        domain: true,
        stepTools: {
          include: {
            step: {
              include: {
                map: true
              }
            }
          }
        }
      },
      orderBy: [
        { domain: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(tools)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}

// POST /api/knowledge-graph/tools - Create new tool
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, domainId, inputSchema, outputSchema, apiEndpoint } = body

    // Validate required fields
    if (!name || !description || !category || !domainId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, domainId' },
        { status: 400 }
      )
    }

    // Check if domain exists
    const domain = await db.domain.findUnique({
      where: { id: domainId }
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    const tool = await db.tool.create({
      data: {
        name,
        description,
        category,
        domainId,
        inputSchema: inputSchema || null,
        outputSchema: outputSchema || null,
        apiEndpoint: apiEndpoint || null
      },
      include: {
        domain: true
      }
    })

    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    )
  }
}