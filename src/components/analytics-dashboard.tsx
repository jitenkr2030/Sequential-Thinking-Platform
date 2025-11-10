"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Brain, 
  Target, 
  Zap,
  Database,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Award,
  Clock,
  CheckCircle
} from "lucide-react"

interface DashboardData {
  overview: {
    totalSessions: number
    completedSessions: number
    completionRate: number
    averageScore: number
    averageReasoningScore: number
  }
  domainStats: Array<{
    domainId: string
    domain: {
      id: string
      name: string
      icon: string
      color: string
    }
    _count: {
      id: number
    }
    _avg: {
      totalScore: number | null
      reasoningScore: number | null
      toolUsageScore: number | null
    }
  }>
  dailyStats: Array<{
    date: string
    session_count: number
    avg_score: number
    avg_reasoning_score: number
  }>
  toolUsage: Array<{
    toolId: string
    tool: {
      id: string
      name: string
      description: string
      category: string
      domain: {
        id: string
        name: string
        icon: string
        color: string
      }
    }
    _count: {
      id: number
    }
  }>
  topPerformingDomains: Array<{
    domainId: string
    domain: {
      id: string
      name: string
      icon: string
      color: string
    }
    _count: {
      id: number
    }
    _avg: {
      totalScore: number | null
      reasoningScore: number | null
      toolUsageScore: number | null
    }
  }>
  recentActivity: Array<{
    id: string
    domain: {
      id: string
      name: string
      icon: string
      color: string
    }
    user?: {
      name: string | null
      email: string | null
    }
    totalScore: number | null
    endTime: Date | null
  }>
}

interface AnalyticsDashboardProps {
  onBack?: () => void
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedDomain, selectedTimeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?domain=${selectedDomain}&timeRange=${selectedTimeRange}`)
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600">Please check back later for insights.</p>
        </div>
      </div>
    )
  }

  const { overview, domainStats, dailyStats, toolUsage, topPerformingDomains, recentActivity } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-gray-600">Reasoning insights and progress tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domainStats.map(stat => (
                <SelectItem key={stat.domainId} value={stat.domain.name}>
                  {stat.domain.icon} {stat.domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedTimeRange} period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.completedSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(overview.completionRate * 100)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reasoning</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.averageReasoningScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Average reasoning quality
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(overview.totalSessions * 0.7)}</div>
                <p className="text-xs text-muted-foreground">
                  Estimated active learners
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Domains */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Domains
              </CardTitle>
              <CardDescription>
                Domains with the highest average reasoning scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingDomains.slice(0, 5).map((stat, index) => (
                  <div key={stat.domainId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{stat.domain.icon}</div>
                      <div>
                        <h4 className="font-medium">{stat.domain.name}</h4>
                        <p className="text-sm text-gray-600">{stat._count.id} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(stat._avg.totalScore || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainStats.map((stat) => (
              <Card key={stat.domainId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{stat.domain.icon}</div>
                      <CardTitle className="text-lg">{stat.domain.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={stat.domain.color}>
                      {stat._count.id}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sessions</span>
                      <span className="font-medium">{stat._count.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Score</span>
                      <span className="font-medium">{Math.round(stat._avg.totalScore || 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reasoning</span>
                      <span className="font-medium">{Math.round(stat._avg.reasoningScore || 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tool Usage</span>
                      <span className="font-medium">{Math.round(stat._avg.toolUsageScore || 0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Tool Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Most Used Tools
              </CardTitle>
              <CardDescription>
                Tools that are most frequently selected in reasoning processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {toolUsage.slice(0, 8).map((stat, index) => (
                  <div key={stat.toolId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{stat.tool.name}</h4>
                        <p className="text-sm text-gray-600">{stat.tool.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={stat.tool.domain.color}>
                        {stat.tool.domain.icon}
                      </Badge>
                      <span className="font-medium">{stat._count.id} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Performance Trend
              </CardTitle>
              <CardDescription>
                Average scores and session counts over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dailyStats.slice(-7).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(stat.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium ml-1">{stat.session_count}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium ml-1">{Math.round(stat.avg_score)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest completed reasoning sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{activity.domain.icon}</div>
                      <div>
                        <h4 className="font-medium">{activity.domain.name}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.user?.name || 'Anonymous user'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.totalScore && (
                        <Badge variant={activity.totalScore >= 80 ? "default" : activity.totalScore >= 70 ? "secondary" : "destructive"}>
                          {activity.totalScore}%
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.endTime ? new Date(activity.endTime).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}