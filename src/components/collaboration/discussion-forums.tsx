"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Pin,
  Lock,
  Unlock,
  Flag,
  Trash2,
  Edit,
  Check,
  X,
  Filter,
  Tag,
  User,
  Calendar,
  TrendingUp
} from "lucide-react"
import { collaborationService, ForumPost, ForumReply, CollaborationUser } from "@/lib/collaboration"

interface DiscussionForumsProps {
  currentUser: CollaborationUser
}

export function DiscussionForums({ currentUser }: DiscussionForumsProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "unanswered">("latest")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    domain: "",
    tags: [] as string[]
  })
  const [newReply, setNewReply] = useState("")
  const [moderationActions, setModerationActions] = useState({
    isPinning: false,
    isLocking: false,
    isDeleting: false
  })

  const domains = [
    "Finance & Accounting",
    "Law", 
    "Medicine",
    "Engineering",
    "Data Science",
    "Business"
  ]

  const popularTags = [
    "help", "discussion", "question", "tutorial", "tips", "resources", "career", "exam"
  ]

  useEffect(() => {
    loadPosts()
    setupEventListeners()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchTerm, selectedDomain, sortBy])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await collaborationService.getForumPosts()
      setPosts(response.posts)
    } catch (error) {
      console.error("Failed to load forum posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupEventListeners = () => {
    collaborationService.on('forumPostCreated', (post: ForumPost) => {
      setPosts(prev => [post, ...prev])
    })

    collaborationService.on('forumReplyCreated', (reply: ForumReply) => {
      setPosts(prev => prev.map(post => 
        post.id === reply.postId 
          ? { ...post, replies: [...post.replies, reply], updatedAt: Date.now() }
          : post
      ))
    })
  }

  const filterAndSortPosts = () => {
    let filtered = [...posts]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by domain
    if (selectedDomain !== "all") {
      filtered = filtered.filter(post => post.domain === selectedDomain)
    }

    // Sort posts
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.likes + b.replies.length) - (a.likes + a.replies.length))
        break
      case "unanswered":
        filtered.sort((a, b) => a.replies.length - b.replies.length)
        break
      default: // latest
        filtered.sort((a, b) => b.updatedAt - a.updatedAt)
    }

    setFilteredPosts(filtered)
  }

  const handleCreatePost = async () => {
    try {
      const postData = {
        ...newPost,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
        isLocked: false,
        views: 0,
        likes: 0,
        replies: []
      }

      const createdPost = await collaborationService.createForumPost(postData)
      setPosts(prev => [createdPost, ...prev])
      setShowCreateDialog(false)
      setNewPost({
        title: "",
        content: "",
        domain: "",
        tags: []
      })
    } catch (error) {
      console.error("Failed to create forum post:", error)
    }
  }

  const handleCreateReply = async (postId: string) => {
    if (!newReply.trim()) return

    try {
      const reply = await collaborationService.createForumReply(postId, newReply)
      setNewReply("")
    } catch (error) {
      console.error("Failed to create forum reply:", error)
    }
  }

  const handleModerationAction = async (action: 'pin' | 'lock' | 'delete', postId: string) => {
    try {
      // Mock moderation action - in real implementation, this would call an API
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          switch (action) {
            case 'pin':
              return { ...post, isPinned: !post.isPinned }
            case 'lock':
              return { ...post, isLocked: !post.isLocked }
            case 'delete':
              return { ...post, isLocked: true } // Soft delete by locking
            default:
              return post
          }
        }
        return post
      }))
    } catch (error) {
      console.error(`Failed to ${action} post:`, error)
    }
  }

  const handleLikePost = async (postId: string) => {
    try {
      // Mock like action - in real implementation, this would call an API
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ))
    } catch (error) {
      console.error("Failed to like post:", error)
    }
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

  const canModerate = (post: ForumPost) => {
    return currentUser.role === 'admin' || currentUser.role === 'instructor'
  }

  const isAuthor = (post: ForumPost) => {
    return post.authorId === currentUser.id
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
          <h2 className="text-2xl font-bold text-gray-900">Discussion Forums</h2>
          <p className="text-gray-600">Engage in domain-specific discussions with the community</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Forum Post</DialogTitle>
              <DialogDescription>
                Start a new discussion in your domain
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Domain</label>
                <select
                  value={newPost.domain}
                  onChange={(e) => setNewPost(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content..."
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newPost.tags.join(", ")}
                  onChange={(e) => setNewPost(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="help, question, tutorial"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreatePost} className="flex-1">
                  Create Post
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {posts.reduce((sum, post) => sum + post.replies.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Replies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {posts.filter(post => post.isPinned).length}
            </div>
            <div className="text-sm text-gray-600">Pinned Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {posts.filter(post => !post.isLocked).length}
            </div>
            <div className="text-sm text-gray-600">Active Discussions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="all">All Domains</option>
          {domains.map(domain => (
            <option key={domain} value={domain}>{domain}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Popular</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </div>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setSearchTerm(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedDomain !== "all" 
                ? "Try adjusting your search or filters"
                : "Be the first to start a discussion!"
              }
            </p>
            {!searchTerm && selectedDomain === "all" && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.isPinned && (
                        <Badge variant="default" className="text-xs">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.isLocked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {post.domain}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => {
                                setSelectedPost(post)
                                setShowPostDialog(true)
                              }}>
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {post.authorName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatTimeAgo(post.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views} views
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  {canModerate(post) && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleModerationAction('pin', post.id)}
                        title={post.isPinned ? "Unpin" : "Pin"}
                      >
                        {post.isPinned ? <Pin className="w-4 h-4" /> : <Pin className="w-4 h-4 text-gray-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleModerationAction('lock', post.id)}
                        title={post.isLocked ? "Unlock" : "Lock"}
                      >
                        {post.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleModerationAction('delete', post.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {post.content}
                  </p>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {post.replies.length} replies
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {post.likes} likes
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLikePost(post.id)}
                        disabled={post.isLocked}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPost(post)
                          setShowPostDialog(true)
                        }}
                      >
                        View Discussion
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Detail Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {selectedPost.authorName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatTimeAgo(selectedPost.createdAt)}
                        </span>
                        <Badge variant="outline">{selectedPost.domain}</Badge>
                      </div>
                    </DialogDescription>
                  </div>
                  {canModerate(selectedPost) && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleModerationAction('pin', selectedPost.id)}
                      >
                        {selectedPost.isPinned ? <Pin className="w-4 h-4" /> : <Pin className="w-4 h-4 text-gray-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleModerationAction('lock', selectedPost.id)}
                      >
                        {selectedPost.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Post Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700">{selectedPost.content}</p>
                  
                  {selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedPost.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Replies ({selectedPost.replies.length})
                  </h3>
                  
                  {/* Reply Input */}
                  {!selectedPost.isLocked && (
                    <div className="space-y-3 mb-6">
                      <Textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Write your reply..."
                        rows={3}
                      />
                      <Button 
                        onClick={() => handleCreateReply(selectedPost.id)}
                        disabled={!newReply.trim()}
                      >
                        Post Reply
                      </Button>
                    </div>
                  )}

                  {/* Replies List */}
                  <div className="space-y-4">
                    {selectedPost.replies.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                        <p>No replies yet. Be the first to reply!</p>
                      </div>
                    ) : (
                      selectedPost.replies.map((reply) => (
                        <div key={reply.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{reply.authorName}</span>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                              {reply.isAccepted && (
                                <Badge variant="default" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Accepted
                                </Badge>
                              )}
                            </div>
                            {isAuthor(selectedPost) && !reply.isAccepted && (
                              <Button size="sm" variant="ghost">
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-700">{reply.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}