import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/analytics/dashboard - Get dashboard analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const timeRange = searchParams.get('timeRange') || '7d' // 7d, 30d, 90d

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    const days = parseInt(timeRange.replace('d', ''))
    startDate.setDate(now.getDate() - days)

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    }
    
    if (domain && domain !== 'all') {
      where.domain = {
        name: { contains: domain, mode: 'insensitive' }
      }
    }

    // Get session statistics
    const [
      totalSessions,
      completedSessions,
      averageScore,
      domainStats,
      dailyStats,
      toolUsageStats
    ] = await Promise.all([
      // Total sessions
      db.learningSession.count({ where }),
      
      // Completed sessions
      db.learningSession.count({
        where: {
          ...where,
          status: 'completed'
        }
      }),
      
      // Average score
      db.learningSession.aggregate({
        where: {
          ...where,
          totalScore: { not: null }
        },
        _avg: {
          totalScore: true
        }
      }),
      
      // Statistics by domain
      db.learningSession.groupBy({
        by: ['domainId'],
        where,
        _count: {
          id: true
        },
        _avg: {
          totalScore: true,
          reasoningScore: true,
          toolUsageScore: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      
      // Daily statistics
      db.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as session_count,
          AVG(totalScore) as avg_score,
          AVG(reasoningScore) as avg_reasoning_score
        FROM learning_sessions 
        WHERE createdAt >= ${startDate.toISOString()}
        ${domain && domain !== 'all' ? `AND domainId IN (SELECT id FROM domains WHERE name LIKE '%${domain}%')` : ''}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      ` as Array<{
        date: string
        session_count: number
        avg_score: number
        avg_reasoning_score: number
      }>,
      
      // Tool usage statistics
      db.thoughtTool.groupBy({
        by: ['toolId'],
        where: {
          thought: {
            session: {
              createdAt: {
                gte: startDate
              }
            }
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ])

    // Get domain details for domain stats
    const domainStatsWithDetails = await Promise.all(
      domainStats.map(async (stat) => {
        const domain = await db.domain.findUnique({
          where: { id: stat.domainId }
        })
        return {
          ...stat,
          domain: domain
        }
      })
    )

    // Get tool details for tool usage stats
    const toolStatsWithDetails = await Promise.all(
      toolUsageStats.map(async (stat) => {
        const tool = await db.tool.findUnique({
          where: { id: stat.toolId },
          include: {
            domain: true
          }
        })
        return {
          ...stat,
          tool: tool
        }
      })
    )

    // Calculate completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    // Calculate score distribution
    const scoreDistribution = await db.learningSession.groupBy({
      by: ['domainId'],
      where: {
        ...where,
        totalScore: { not: null }
      },
      _count: {
        id: true
      },
      having: {
        totalScore: {
          gte: 0
        }
      }
    })

    const dashboardData = {
      overview: {
        totalSessions,
        completedSessions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: Math.round(averageScore._avg.totalScore || 0),
        averageReasoningScore: Math.round((await db.learningSession.aggregate({
          where: { ...where, reasoningScore: { not: null } },
          _avg: { reasoningScore: true }
        }))._avg.reasoningScore || 0)
      },
      domainStats: domainStatsWithDetails,
      dailyStats: dailyStats.map(stat => ({
        ...stat,
        date: new Date(stat.date).toISOString().split('T')[0]
      })),
      toolUsage: toolStatsWithDetails,
      topPerformingDomains: domainStatsWithDetails
        .filter(stat => stat._avg.totalScore)
        .sort((a, b) => (b._avg.totalScore || 0) - (a._avg.totalScore || 0))
        .slice(0, 5),
      recentActivity: await db.learningSession.findMany({
        where: {
          ...where,
          endTime: { not: null }
        },
        include: {
          domain: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          endTime: 'desc'
        },
        take: 10
      })
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}