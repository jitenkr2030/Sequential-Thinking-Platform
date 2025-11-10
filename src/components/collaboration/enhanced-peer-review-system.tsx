"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Star, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  Target,
  Brain,
  Lightbulb,
  FileText,
  Award,
  TrendingUp,
  Filter,
  Search,
  Plus,
  BarChart,
  PieChart,
  Activity,
  Zap,
  BookOpen,
  Users,
  Calendar,
  Flag,
  Check,
  X,
  HelpCircle,
  Info
} from "lucide-react"
import { collaborationService, PeerReview, CollaborationUser } from "@/lib/collaboration"

interface EnhancedPeerReviewSystemProps {
  currentUser: CollaborationUser
  reasoningMaps?: any[]
}

interface ReviewCriteria {
  id: string
  name: string
  description: string
  weight: number
  minScore: number
  maxScore: number
}

interface ReviewAnalytics {
  totalReviews: number
  averageRating: number
  completionRate: number
  topPerformers: string[]
  improvementAreas: string[]
  domainBreakdown: { [key: string]: number }
}

interface ReviewTemplate {
  id: string
  name: string
  domain: string
  criteria: ReviewCriteria[]
  description: string
}

export function EnhancedPeerReviewSystem({ currentUser, reasoningMaps = [] }: EnhancedPeerReviewSystemProps) {
  const [reviews, setReviews] = useState<PeerReview[]>([])
  const [pendingReviews, setPendingReviews] = useState<PeerReview[]>([])
  const [completedReviews, setCompletedReviews] = useState<PeerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'given' | 'pending' | 'analytics'>('received')
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PeerReview | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: "",
    criteria: {
      logicalFlow: 5,
      evidenceUse: 5,
      conclusionQuality: 5,
      toolApplication: 5,
      clarity: 5,
      depth: 5
    },
    strengths: [] as string[],
    improvements: [] as string[],
    suggestions: ""
  })
  const [newReviewRequest, setNewReviewRequest] = useState({
    reasoningId: "",
    domain: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    deadline: "",
    specificInstructions: ""
  })
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDomain, setFilterDomain] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const reviewTemplates: ReviewTemplate[] = [
    {
      id: "logical-reasoning",
      name: "Logical Reasoning Review",
      domain: "General",
      description: "Comprehensive review of logical reasoning and analytical thinking",
      criteria: [
        {
          id: "logicalFlow",
          name: "Logical Flow",
          description: "Coherence and logical progression of reasoning",
          weight: 0.25,
          minScore: 1,
          maxScore: 5
        },
        {
          id: "evidenceUse",
          name: "Evidence Use",
          description: "Quality and relevance of supporting evidence",
          weight: 0.25,
          minScore: 1,
          maxScore: 5
        },
        {
          id: "conclusionQuality",
          name: "Conclusion Quality",
          description: "Strength and validity of conclusions",
          weight: 0.25,
          minScore: 1,
          maxScore: 5
        },
        {
          id: "toolApplication",
          name: "Tool Application",
          description: "Effective use of analytical tools and methods",
          weight: 0.25,
          minScore: 1,
          maxScore: 5
        }
      ]
    },
    {
      id: "domain-specific",
      name: "Domain-Specific Review",
      domain: "Specialized",
      description: "Review tailored to specific domain requirements",
      criteria: [
        {
          id: "domainKnowledge",
          name: "Domain Knowledge",
          description: "Accuracy and depth of domain-specific knowledge",
          weight: 0.3,
          minScore: 1,
          maxScore: 5
        },
        {
          id: "methodology",
          name: "Methodology",
          description: "Appropriate use of domain-specific methodologies",
          weight: 0.3,
          minScore: 1,
          maxScore: 5
        },
        {
          id: "practicalApplication",
          name: "Practical Application",
          description: "Real-world applicability of reasoning",
          weight: 0.4,
          minScore: 1,
          maxScore: 5
        }
      ]
    }
  ]

  const domains = [
    "Finance & Accounting",
    "Law", 
    "Medicine",
    "Engineering",
    "Data Science",
    "Business"
  ]

  const strengthOptions = [
    "Clear logical structure",
    "Excellent evidence use",
    "Strong analytical thinking",
    "Well-supported conclusions",
    "Creative problem-solving",
    "Thorough research",
    "Effective communication",
    "Critical thinking skills"
  ]

  const improvementOptions = [
    "Need more supporting evidence",
    "Improve logical flow",
    "Strengthen conclusions",
    "Better tool application",
    "More detailed analysis",
    "Clearer explanations",
    "Better structure",
    "More comprehensive research"
  ]

  useEffect(() => {
    loadReviews()
    loadAnalytics()
    setupEventListeners()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const [allReviews, pending] = await Promise.all([
        collaborationService.getPeerReviews(currentUser.id),
        collaborationService.getPendingPeerReviews(currentUser.id)
      ])
      
      setReviews(allReviews)
      setPendingReviews(pending)
      setCompletedReviews(allReviews.filter(review => review.status === 'completed'))
    } catch (error) {
      console.error("Failed to load peer reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      const mockAnalytics: ReviewAnalytics = {
        totalReviews: completedReviews.length,
        averageRating: completedReviews.length > 0 
          ? completedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / completedReviews.length 
          : 0,
        completionRate: reviews.length > 0 
          ? (completedReviews.length / reviews.length) * 100 
          : 0,
        topPerformers: ["Logical Reasoning", "Evidence Analysis", "Critical Thinking"],
        improvementAreas: ["Tool Application", "Conclusion Quality"],
        domainBreakdown: {
          "Data Science": 35,
          "Medicine": 25,
          "Law": 20,
          "Business": 15,
          "Engineering": 5
        }
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  const setupEventListeners = () => {
    collaborationService.on('peerReviewRequested', (review: PeerReview) => {
      setPendingReviews(prev => [...prev, review])
    })

    collaborationService.on('peerReviewSubmitted', (review: PeerReview) => {
      setReviews(prev => [...prev, review])
      setPendingReviews(prev => prev.filter(r => r.id !== review.id))
      setCompletedReviews(prev => [...prev, review])
      loadAnalytics()
    })

    collaborationService.on('peerReviewUpdated', (review: PeerReview) => {
      setReviews(prev => prev.map(r => r.id === review.id ? review : r))
      setCompletedReviews(prev => prev.map(r => r.id === review.id ? review : r))
      loadAnalytics()
    })
  }

  const handleSubmitReview = async () => {
    if (!selectedReview) return

    try {
      const reviewData = {
        ...reviewForm,
        status: 'completed' as const
      }

      await collaborationService.submitPeerReview(selectedReview.id, reviewData.rating, reviewForm.feedback)
      setShowReviewDialog(false)
      setSelectedReview(null)
      setReviewForm({
        rating: 5,
        feedback: "",
        criteria: {
          logicalFlow: 5,
          evidenceUse: 5,
          conclusionQuality: 5,
          toolApplication: 5,
          clarity: 5,
          depth: 5
        },
        strengths: [],
        improvements: [],
        suggestions: ""
      })
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  const handleRequestReview = async () => {
    try {
      await collaborationService.requestPeerReview(
        newReviewRequest.reasoningId,
        newReviewRequest.domain,
        newReviewRequest.content
      )
      setShowRequestDialog(false)
      setNewReviewRequest({
        reasoningId: "",
        domain: "",
        content: "",
        priority: "medium",
        deadline: "",
        specificInstructions: ""
      })
    } catch (error) {
      console.error("Failed to request peer review:", error)
    }
  }

  const getAverageRating = (criteria: any) => {
    const values = Object.values(criteria)
    return values.reduce((sum: number, val: number) => sum + val, 0) / values.length
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-amber-600"
    return "text-red-600"
  }

  const getCriteriaIcon = (criteria: string) => {
    switch (criteria) {
      case 'logicalFlow': return <Target className="w-4 h-4" />
      case 'evidenceUse': return <FileText className="w-4 h-4" />
      case 'conclusionQuality': return <Brain className="w-4 h-4" />
      case 'toolApplication': return <Lightbulb className="w-4 h-4" />
      case 'clarity': return <Eye className="w-4 h-4" />
      case 'depth': return <BarChart className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getCriteriaLabel = (criteria: string) => {
    switch (criteria) {
      case 'logicalFlow': return "Logical Flow"
      case 'evidenceUse': return "Evidence Use"
      case 'conclusionQuality': return "Conclusion Quality"
      case 'toolApplication': return "Tool Application"
      case 'clarity': return "Clarity"
      case 'depth': return "Depth"
      default: return criteria
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-amber-100 text-amber-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchTerm || 
      review.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = filterDomain === "all" || review.domain === filterDomain
    const matchesStatus = filterStatus === "all" || review.status === filterStatus
    
    return matchesSearch && matchesDomain && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Peer Review System</h2>
          <p className="text-gray-600">Comprehensive reasoning evaluation with detailed feedback</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedReviews.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingReviews.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Peer Review</DialogTitle>
                <DialogDescription>
                  Get detailed feedback on your reasoning from peers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Reasoning ID</label>
                    <Select onValueChange={(value) => setNewReviewRequest(prev => ({ ...prev, reasoningId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reasoning" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasoningMaps.map((map, index) => (
                          <SelectItem key={index} value={map.id || `reasoning-${index}`}>
                            {map.title || `Reasoning ${index + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <Select onValueChange={(value) => setNewReviewRequest(prev => ({ ...prev, domain: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map(domain => (
                          <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Content to Review</label>
                  <Textarea
                    value={newReviewRequest.content}
                    onChange={(e) => setNewReviewRequest(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe the reasoning you want reviewed..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select onValueChange={(value: any) => setNewReviewRequest(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deadline (optional)</label>
                    <Input
                      type="datetime-local"
                      value={newReviewRequest.deadline}
                      onChange={(e) => setNewReviewRequest(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Specific Instructions</label>
                  <Textarea
                    value={newReviewRequest.specificInstructions}
                    onChange={(e) => setNewReviewRequest(prev => ({ ...prev, specificInstructions: e.target.value }))}
                    placeholder="Any specific areas you'd like the reviewer to focus on..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleRequestReview} className="flex-1">
                    Send Request
                  </Button>
                  <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'received' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reviews Received
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'given' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reviews Given
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Reviews
          {pendingReviews.length > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {pendingReviews.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-gray-600">You're all caught up with peer reviews!</p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Review Request</CardTitle>
                      <CardDescription>
                        Requested {formatTimeAgo(review.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor('medium')}>
                        Medium Priority
                      </Badge>
                      <Badge variant="outline">
                        {review.domain}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content to Review</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{review.content}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setSelectedReview(review)
                        setShowReviewDialog(true)
                      }}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">All Domains</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {filteredReviews.filter(r => r.revieweeId === currentUser.id).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Received</h3>
                <p className="text-gray-600 mb-4">
                  Request peer reviews to get feedback on your reasoning
                </p>
                {reasoningMaps.length > 0 && (
                  <Button onClick={() => setShowRequestDialog(true)}>
                    Request Review
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredReviews
              .filter(r => r.revieweeId === currentUser.id)
              .map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-500" />
                          {review.rating}/5 Rating
                        </CardTitle>
                        <CardDescription>
                          Reviewed {formatTimeAgo(review.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Criteria Breakdown */}
                      <div>
                        <h4 className="font-medium mb-3">Evaluation Criteria</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(review.criteria).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                {getCriteriaIcon(key)}
                                <span className="text-sm">{getCriteriaLabel(key)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress value={value * 20} className="w-16 h-2" />
                                <span className={`text-sm font-medium ${getRatingColor(value)}`}>
                                  {value}/5
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback */}
                      {review.feedback && (
                        <div>
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">{review.feedback}</p>
                          </div>
                        </div>
                      )}

                      {/* Overall Assessment */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Overall Assessment</span>
                        <div className="flex items-center space-x-2">
                          {getAverageRating(review.criteria) >= 4 ? (
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${getRatingColor(getAverageRating(review.criteria))}`}>
                            {getAverageRating(review.criteria).toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {activeTab === 'given' && (
        <div className="space-y-4">
          {completedReviews.filter(r => r.reviewerId === currentUser.id).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Given</h3>
                <p className="text-gray-600">Help others improve by reviewing their reasoning</p>
              </CardContent>
            </Card>
          ) : (
            completedReviews
              .filter(r => r.reviewerId === currentUser.id)
              .map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-500" />
                          Review Given
                        </CardTitle>
                        <CardDescription>
                          Submitted {formatTimeAgo(review.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating Given</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                      
                      {review.feedback && (
                        <div>
                          <h4 className="font-medium mb-2">Your Feedback</h4>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-700">{review.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalReviews}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.completionRate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingReviews.length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Domain Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.domainBreakdown).map(([domain, percentage]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{domain}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={percentage} className="w-24 h-2" />
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Top Performing Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.topPerformers.map((area, index) => (
                  <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.improvementAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-amber-600 border-amber-600">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Peer Review</DialogTitle>
            <DialogDescription>
              Provide detailed feedback on the reasoning process
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              {/* Review Content */}
              <div>
                <h4 className="font-medium mb-2">Content to Review</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedReview.content}</p>
                </div>
              </div>

              <Tabs defaultValue="criteria" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="criteria">Criteria</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="criteria" className="space-y-4">
                  <h4 className="font-medium">Rate Each Criterion</h4>
                  <div className="space-y-4">
                    {Object.entries(reviewForm.criteria).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getCriteriaIcon(key)}
                            <span className="text-sm font-medium">{getCriteriaLabel(key)}</span>
                          </div>
                          <span className={`text-sm font-medium ${getRatingColor(value)}`}>
                            {value}/5
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={value}
                            onChange={(e) => setReviewForm(prev => ({
                              ...prev,
                              criteria: { ...prev.criteria, [key]: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 cursor-pointer ${
                                  star <= value ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                                onClick={() => setReviewForm(prev => ({
                                  ...prev,
                                  criteria: { ...prev.criteria, [key]: star }
                                }))}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  <h4 className="font-medium">Overall Feedback</h4>
                  <Textarea
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                    placeholder="Provide comprehensive feedback on the reasoning..."
                    rows={6}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Strengths</h5>
                      <div className="space-y-2">
                        {strengthOptions.map((strength) => (
                          <label key={strength} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={reviewForm.strengths.includes(strength)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReviewForm(prev => ({
                                    ...prev,
                                    strengths: [...prev.strengths, strength]
                                  }))
                                } else {
                                  setReviewForm(prev => ({
                                    ...prev,
                                    strengths: prev.strengths.filter(s => s !== strength)
                                  }))
                                }
                              }}
                            />
                            <span className="text-sm">{strength}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Areas for Improvement</h5>
                      <div className="space-y-2">
                        {improvementOptions.map((improvement) => (
                          <label key={improvement} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={reviewForm.improvements.includes(improvement)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReviewForm(prev => ({
                                    ...prev,
                                    improvements: [...prev.improvements, improvement]
                                  }))
                                } else {
                                  setReviewForm(prev => ({
                                    ...prev,
                                    improvements: prev.improvements.filter(i => i !== improvement)
                                  }))
                                }
                              }}
                            />
                            <span className="text-sm">{improvement}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  <h4 className="font-medium">Specific Suggestions</h4>
                  <Textarea
                    value={reviewForm.suggestions}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, suggestions: e.target.value }))}
                    placeholder="Provide specific, actionable suggestions for improvement..."
                    rows={6}
                  />
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Review Guidelines
                    </h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Be specific and constructive in your feedback</li>
                      <li>• Focus on the reasoning process, not just the conclusion</li>
                      <li>• Provide actionable suggestions for improvement</li>
                      <li>• Acknowledge strengths and areas of excellence</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Overall Rating */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Rating</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${
                            star <= reviewForm.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        />
                      ))}
                    </div>
                    <span className={`text-lg font-bold ${getRatingColor(reviewForm.rating)}`}>
                      {reviewForm.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={handleSubmitReview} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}