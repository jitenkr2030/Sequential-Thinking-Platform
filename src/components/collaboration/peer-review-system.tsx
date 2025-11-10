"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  FileText
} from "lucide-react"
import { collaborationService, PeerReview, CollaborationUser } from "@/lib/collaboration"

interface PeerReviewSystemProps {
  currentUser: CollaborationUser
  reasoningMaps?: any[]
}

export function PeerReviewSystem({ currentUser, reasoningMaps = [] }: PeerReviewSystemProps) {
  const [reviews, setReviews] = useState<PeerReview[]>([])
  const [pendingReviews, setPendingReviews] = useState<PeerReview[]>([])
  const [completedReviews, setCompletedReviews] = useState<PeerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'given' | 'pending'>('received')
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PeerReview | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: "",
    criteria: {
      logicalFlow: 5,
      evidenceUse: 5,
      conclusionQuality: 5,
      toolApplication: 5
    }
  })

  useEffect(() => {
    loadReviews()
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

  const setupEventListeners = () => {
    collaborationService.on('peerReviewRequested', (review: PeerReview) => {
      setPendingReviews(prev => [...prev, review])
    })

    collaborationService.on('peerReviewSubmitted', (review: PeerReview) => {
      setReviews(prev => [...prev, review])
      setPendingReviews(prev => prev.filter(r => r.id !== review.id))
      setCompletedReviews(prev => [...prev, review])
    })

    collaborationService.on('peerReviewUpdated', (review: PeerReview) => {
      setReviews(prev => prev.map(r => r.id === review.id ? review : r))
      setCompletedReviews(prev => prev.map(r => r.id === review.id ? review : r))
    })
  }

  const handleSubmitReview = async () => {
    if (!selectedReview) return

    try {
      const reviewData = {
        ...reviewForm,
        status: 'completed' as const
      }

      await collaborationService.submitPeerReview(selectedReview.id, reviewData)
      setShowReviewDialog(false)
      setSelectedReview(null)
      setReviewForm({
        rating: 5,
        feedback: "",
        criteria: {
          logicalFlow: 5,
          evidenceUse: 5,
          conclusionQuality: 5,
          toolApplication: 5
        }
      })
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  const handleRequestReview = async (reasoningId: string, reviewerId: string) => {
    try {
      await collaborationService.requestPeerReview(reasoningId, reviewerId)
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
      default: return <Star className="w-4 h-4" />
    }
  }

  const getCriteriaLabel = (criteria: string) => {
    switch (criteria) {
      case 'logicalFlow': return "Logical Flow"
      case 'evidenceUse': return "Evidence Use"
      case 'conclusionQuality': return "Conclusion Quality"
      case 'toolApplication': return "Tool Application"
      default: return criteria
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Peer Review System</h2>
          <p className="text-gray-600">Get feedback on your reasoning and help others improve</p>
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
                    <Badge variant="outline">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reasoning ID</span>
                      <span className="text-sm font-medium">{review.reasoningId}</span>
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
          {completedReviews.filter(r => r.revieweeId === currentUser.id).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Received</h3>
                <p className="text-gray-600 mb-4">
                  Request peer reviews to get feedback on your reasoning
                </p>
                {reasoningMaps.length > 0 && (
                  <Button variant="outline">
                    Request Review
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            completedReviews
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
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
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

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Peer Review</DialogTitle>
            <DialogDescription>
              Provide constructive feedback to help improve reasoning quality
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Overall Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>

              {/* Criteria Ratings */}
              <div>
                <label className="text-sm font-medium mb-3 block">Evaluation Criteria</label>
                <div className="space-y-3">
                  {Object.entries(reviewForm.criteria).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCriteriaIcon(key)}
                        <span className="text-sm font-medium">{getCriteriaLabel(key)}</span>
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
                          className="w-24"
                        />
                        <span className="text-sm font-medium w-8">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Feedback</label>
                <Textarea
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide specific, constructive feedback to help improve the reasoning..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={handleSubmitReview} className="flex-1">
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