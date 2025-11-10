"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Star, 
  TrendingUp,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Activity,
  Award,
  BookOpen,
  Target,
  Brain
} from "lucide-react"
import { EnhancedStudyGroups } from "./enhanced-study-groups"
import { EnhancedPeerReviewSystem } from "./enhanced-peer-review-system"
import { EnhancedLiveInstructorSessions } from "./enhanced-live-instructor-sessions"
import { DiscussionForums } from "./discussion-forums"
import { collaborationService, CollaborationUser } from "@/lib/collaboration"

interface CollaborationDashboardProps {
  currentUser: CollaborationUser
  onBack?: () => void
}

interface CollaborationStats {
  totalStudyGroups: number
  activeStudyGroups: number
  pendingReviews: number
  completedReviews: number
  upcomingSessions: number
  liveSessions: number
  forumPosts: number
  forumReplies: number
}

export function CollaborationDashboard({ currentUser, onBack }: CollaborationDashboardProps) {
  const [stats, setStats] = useState<CollaborationStats>({
    totalStudyGroups: 0,
    activeStudyGroups: 0,
    pendingReviews: 0,
    completedReviews: 0,
    upcomingSessions: 0,
    liveSessions: 0,
    forumPosts: 0,
    forumReplies: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadStats()
    setupEventListeners()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Load data from various sources
      const [studyGroups, pendingReviews, completedReviews, liveSessions, forumPosts] = await Promise.all([
        collaborationService.getStudyGroups(),
        collaborationService.getPendingPeerReviews(currentUser.id),
        collaborationService.getPeerReviews(currentUser.id),
        collaborationService.getLiveSessions(),
        collaborationService.getForumPosts()
      ])

      const now = Date.now()
      const upcomingSessions = liveSessions.filter(session => 
        session.status === 'scheduled' && session.scheduledAt > now
      ).length

      const liveSessionsCount = liveSessions.filter(session => 
        session.status === 'live' || 
        (session.status === 'scheduled' && 
         session.scheduledAt <= now && 
         session.scheduledAt + (session.duration * 60000) > now)
      ).length

      const activeStudyGroups = studyGroups.filter(group => 
        group.activeSession !== undefined
      ).length

      const totalReplies = forumPosts.posts.reduce((sum, post) => sum + post.replies.length, 0)

      setStats({
        totalStudyGroups: studyGroups.length,
        activeStudyGroups,
        pendingReviews: pendingReviews.length,
        completedReviews: completedReviews.filter(r => r.status === 'completed').length,
        upcomingSessions,
        liveSessions: liveSessionsCount,
        forumPosts: forumPosts.posts.length,
        forumReplies: totalReplies
      })
    } catch (error) {
      console.error("Failed to load collaboration stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupEventListeners = () => {
    collaborationService.on('studyGroupCreated', () => loadStats())
    collaborationService.on('studyGroupSessionStarted', () => loadStats())
    collaborationService.on('studyGroupSessionEnded', () => loadStats())
    collaborationService.on('peerReviewRequested', () => loadStats())
    collaborationService.on('peerReviewSubmitted', () => loadStats())
    collaborationService.on('liveSessionStarted', () => loadStats())
    collaborationService.on('liveSessionEnded', () => loadStats())
    collaborationService.on('forumPostCreated', () => loadStats())
    collaborationService.on('forumReplyCreated', () => loadStats())
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string
    value: number | string
    icon: any
    description?: string
    trend?: 'up' | 'down' | 'stable'
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <TrendingUp className={`w-3 h-3 mr-1 ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`} />
            <span className={
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }>
              {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  ← Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Collaboration Hub</h1>
                <p className="text-sm text-gray-600">Connect, learn, and grow together</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
            <TabsTrigger value="peer-review">Peer Review</TabsTrigger>
            <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="forums">Forums</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to the Collaboration Hub
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Connect with peers, get expert feedback, and accelerate your learning journey
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Join Study Group
                    </Button>
                    <Button size="lg" variant="outline">
                      <Calendar className="w-5 h-5 mr-2" />
                      Attend Live Session
                    </Button>
                    <Button size="lg" variant="outline">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Join Discussion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Study Groups"
                value={`${stats.activeStudyGroups}/${stats.totalStudyGroups}`}
                icon={Users}
                description="Active groups"
                trend="up"
              />
              <StatCard
                title="Peer Reviews"
                value={`${stats.completedReviews}/${stats.completedReviews + stats.pendingReviews}`}
                icon={Star}
                description="Completed reviews"
                trend="up"
              />
              <StatCard
                title="Live Sessions"
                value={`${stats.liveSessions}/${stats.upcomingSessions + stats.liveSessions}`}
                icon={Calendar}
                description="Live now"
                trend="stable"
              />
              <StatCard
                title="Forum Activity"
                value={`${stats.forumReplies}/${stats.forumPosts}`}
                icon={MessageSquare}
                description="Replies per post"
                trend="up"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-blue-100 rounded-full w-fit">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Study Groups</CardTitle>
                  <CardDescription>
                    Join collaborative learning sessions with peers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("study-groups")}
                  >
                    Explore Groups
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-green-100 rounded-full w-fit">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Peer Review</CardTitle>
                  <CardDescription>
                    Get feedback on your reasoning from experts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("peer-review")}
                  >
                    View Reviews
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-purple-100 rounded-full w-fit">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Live Sessions</CardTitle>
                  <CardDescription>
                    Attend real-time virtual classrooms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("live-sessions")}
                  >
                    Join Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-orange-100 rounded-full w-fit">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Discussion Forums</CardTitle>
                  <CardDescription>
                    Engage in domain-specific discussions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("forums")}
                  >
                    Browse Forums
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your collaboration network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New study group created</p>
                      <p className="text-xs text-gray-600">Advanced Data Science • 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Peer review completed</p>
                      <p className="text-xs text-gray-600">Your reasoning received 5/5 rating • 4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Live session starting soon</p>
                      <p className="text-xs text-gray-600">Medical Ethics • In 30 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New forum reply</p>
                      <p className="text-xs text-gray-600">Someone replied to your post • 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study-groups">
            <EnhancedStudyGroups currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="peer-review">
            <EnhancedPeerReviewSystem currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="live-sessions">
            <EnhancedLiveInstructorSessions currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="forums">
            <DiscussionForums currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}