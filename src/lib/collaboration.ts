// Real-time collaboration service for Sequential Thinking Platform
export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'student' | 'instructor' | 'admin'
  joinedAt: number
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  domain: string
  createdBy: string
  createdAt: number
  members: CollaborationUser[]
  currentMembers: number
  maxMembers: number
  isPrivate: boolean
  activeSession?: {
    id: string
    scenarioId: string
    startedAt: number
    participants: string[]
  }
}

export interface StudyGroupSession {
  id: string
  groupId: string
  scenarioId: string
  status: 'waiting' | 'active' | 'completed' | 'cancelled'
  startedAt?: number
  endedAt?: number
  participants: CollaborationUser[]
  currentStep: number
  sharedWhiteboard?: {
    data: any
    version: number
  }
  chatMessages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'action'
}

export interface PeerReview {
  id: string
  requesterId: string
  reviewerId?: string
  reasoningId: string
  content: string
  domain: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: number
  reviewedAt?: number
  rating?: number
  feedback?: string
  comments?: ReviewComment[]
}

export interface ReviewComment {
  id: string
  reviewId: string
  userId: string
  content: string
  timestamp: number
  type: 'suggestion' | 'correction' | 'praise' | 'question'
}

export interface LiveSession {
  id: string
  instructorId: string
  title: string
  description: string
  domain: string
  scheduledAt: number
  duration: number // in minutes
  status: 'scheduled' | 'starting' | 'live' | 'ended' | 'cancelled'
  participants: CollaborationUser[]
  maxParticipants: number
  recording?: boolean
  whiteboard?: {
    enabled: boolean
    data: any
  }
  screenShare?: {
    enabled: boolean
    streamId?: string
  }
}

export interface ForumPost {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  domain: string
  tags: string[]
  createdAt: number
  updatedAt: number
  isPinned: boolean
  isLocked: boolean
  views: number
  likes: number
  replies: ForumReply[]
}

export interface ForumReply {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  createdAt: number
  updatedAt: number
  likes: number
  isAccepted: boolean
}

// Event types for real-time updates
export type CollaborationEvent = 
  | { type: 'studyGroupCreated'; payload: StudyGroup }
  | { type: 'studyGroupJoined'; payload: { groupId: string; user: CollaborationUser } }
  | { type: 'studyGroupLeft'; payload: { groupId: string; userId: string } }
  | { type: 'studyGroupSessionStarted'; payload: { groupId: string; sessionId: string } }
  | { type: 'studyGroupSessionEnded'; payload: { groupId: string } }
  | { type: 'studyGroupMessage'; payload: ChatMessage }
  | { type: 'peerReviewRequested'; payload: PeerReview }
  | { type: 'peerReviewSubmitted'; payload: PeerReview }
  | { type: 'liveSessionStarted'; payload: LiveSession }
  | { type: 'liveSessionEnded'; payload: { sessionId: string } }
  | { type: 'forumPostCreated'; payload: ForumPost }
  | { type: 'forumReplyCreated'; payload: ForumReply }
  | { type: 'whiteboardUpdated'; payload: { sessionId: string; data: any; version: number } }
  | { type: 'userJoinedSession'; payload: { sessionId: string; user: CollaborationUser } }
  | { type: 'userLeftSession'; payload: { sessionId: string; userId: string } }

class CollaborationService {
  private socket: any = null
  private eventListeners: Map<string, ((payload: any) => void)[]> = new Map()
  private currentUser: CollaborationUser | null = null

  // Initialize the collaboration service
  async initialize(currentUser: CollaborationUser) {
    this.currentUser = currentUser
    
    // Initialize socket connection
    if (typeof window !== 'undefined') {
      const io = await import('socket.io-client')
      this.socket = io.default(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: {
          userId: currentUser.id,
          userName: currentUser.name
        }
      })

      this.setupSocketHandlers()
    }
  }

  private setupSocketHandlers() {
    if (!this.socket) return

    // Handle incoming collaboration events
    this.socket.on('collaboration-event', (event: CollaborationEvent) => {
      this.emit(event.type, event.payload)
    })

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Connected to collaboration server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
    })

    // Handle study group events
    this.socket.on('study-group-created', (group: StudyGroup) => {
      this.emit('studyGroupCreated', group)
    })

    this.socket.on('study-group-joined', (data: { groupId: string; user: CollaborationUser }) => {
      this.emit('studyGroupJoined', data)
    })

    this.socket.on('study-group-left', (data: { groupId: string; userId: string }) => {
      this.emit('studyGroupLeft', data)
    })

    this.socket.on('study-group-session-started', (data: { groupId: string; sessionId: string }) => {
      this.emit('studyGroupSessionStarted', data)
    })

    this.socket.on('study-group-session-ended', (data: { groupId: string }) => {
      this.emit('studyGroupSessionEnded', data)
    })

    this.socket.on('study-group-message', (message: ChatMessage) => {
      this.emit('studyGroupMessage', message)
    })

    // Handle peer review events
    this.socket.on('peer-review-requested', (review: PeerReview) => {
      this.emit('peerReviewRequested', review)
    })

    this.socket.on('peer-review-submitted', (review: PeerReview) => {
      this.emit('peerReviewSubmitted', review)
    })

    // Handle live session events
    this.socket.on('live-session-started', (session: LiveSession) => {
      this.emit('liveSessionStarted', session)
    })

    this.socket.on('live-session-ended', (data: { sessionId: string }) => {
      this.emit('liveSessionEnded', data)
    })

    // Handle forum events
    this.socket.on('forum-post-created', (post: ForumPost) => {
      this.emit('forumPostCreated', post)
    })

    this.socket.on('forum-reply-created', (reply: ForumReply) => {
      this.emit('forumReplyCreated', reply)
    })

    // Handle whiteboard events
    this.socket.on('whiteboard-updated', (data: { sessionId: string; data: any; version: number }) => {
      this.emit('whiteboardUpdated', data)
    })

    // Handle session participant events
    this.socket.on('user-joined-session', (data: { sessionId: string; user: CollaborationUser }) => {
      this.emit('userJoinedSession', data)
    })

    this.socket.on('user-left-session', (data: { sessionId: string; userId: string }) => {
      this.emit('userLeftSession', data)
    })
  }

  // Event handling
  on(event: string, callback: (payload: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: (payload: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, payload: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(payload))
    }
  }

  // Study Group Methods
  async getStudyGroups(): Promise<StudyGroup[]> {
    try {
      const response = await fetch('/api/collaboration/study-groups')
      if (!response.ok) throw new Error('Failed to fetch study groups')
      return await response.json()
    } catch (error) {
      console.error('Error fetching study groups:', error)
      return []
    }
  }

  async createStudyGroup(groupData: Partial<StudyGroup>): Promise<StudyGroup> {
    try {
      const response = await fetch('/api/collaboration/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })
      if (!response.ok) throw new Error('Failed to create study group')
      return await response.json()
    } catch (error) {
      console.error('Error creating study group:', error)
      throw error
    }
  }

  async joinStudyGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/study-groups/${groupId}/join`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to join study group')
    } catch (error) {
      console.error('Error joining study group:', error)
      throw error
    }
  }

  async leaveStudyGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/study-groups/${groupId}/leave`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to leave study group')
    } catch (error) {
      console.error('Error leaving study group:', error)
      throw error
    }
  }

  async startStudyGroupSession(groupId: string, scenarioId: string): Promise<string> {
    try {
      const response = await fetch(`/api/collaboration/study-groups/${groupId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      })
      if (!response.ok) throw new Error('Failed to start session')
      const data = await response.json()
      return data.sessionId
    } catch (error) {
      console.error('Error starting study group session:', error)
      throw error
    }
  }

  async getStudyGroupSession(sessionId: string): Promise<StudyGroupSession> {
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch session')
      return await response.json()
    } catch (error) {
      console.error('Error fetching study group session:', error)
      throw error
    }
  }

  async sendStudyGroupMessage(sessionId: string, content: string): Promise<void> {
    if (!this.socket) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId,
      userId: this.currentUser!.id,
      userName: this.currentUser!.name,
      content,
      timestamp: Date.now(),
      type: 'text'
    }

    this.socket.emit('send-study-group-message', message)
  }

  // Peer Review Methods
  async getPendingPeerReviews(userId: string): Promise<PeerReview[]> {
    try {
      const response = await fetch(`/api/collaboration/peer-reviews/pending/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch pending reviews')
      return await response.json()
    } catch (error) {
      console.error('Error fetching pending peer reviews:', error)
      return []
    }
  }

  async getPeerReviews(userId: string): Promise<PeerReview[]> {
    try {
      const response = await fetch(`/api/collaboration/peer-reviews/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch peer reviews')
      return await response.json()
    } catch (error) {
      console.error('Error fetching peer reviews:', error)
      return []
    }
  }

  async requestPeerReview(reasoningId: string, domain: string, content: string): Promise<PeerReview> {
    try {
      const response = await fetch('/api/collaboration/peer-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasoningId, domain, content })
      })
      if (!response.ok) throw new Error('Failed to request peer review')
      return await response.json()
    } catch (error) {
      console.error('Error requesting peer review:', error)
      throw error
    }
  }

  async submitPeerReview(reviewId: string, rating: number, feedback: string): Promise<PeerReview> {
    try {
      const response = await fetch(`/api/collaboration/peer-reviews/${reviewId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      })
      if (!response.ok) throw new Error('Failed to submit peer review')
      return await response.json()
    } catch (error) {
      console.error('Error submitting peer review:', error)
      throw error
    }
  }

  // Live Session Methods
  async getLiveSessions(): Promise<LiveSession[]> {
    try {
      const response = await fetch('/api/collaboration/live-sessions')
      if (!response.ok) throw new Error('Failed to fetch live sessions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching live sessions:', error)
      return []
    }
  }

  async createLiveSession(sessionData: Partial<LiveSession>): Promise<LiveSession> {
    try {
      const response = await fetch('/api/collaboration/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      if (!response.ok) throw new Error('Failed to create live session')
      return await response.json()
    } catch (error) {
      console.error('Error creating live session:', error)
      throw error
    }
  }

  async joinLiveSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/live-sessions/${sessionId}/join`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to join live session')
    } catch (error) {
      console.error('Error joining live session:', error)
      throw error
    }
  }

  async leaveLiveSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/live-sessions/${sessionId}/leave`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to leave live session')
    } catch (error) {
      console.error('Error leaving live session:', error)
      throw error
    }
  }

  // Forum Methods
  async getForumPosts(domain?: string): Promise<{ posts: ForumPost[] }> {
    try {
      const url = domain ? `/api/collaboration/forum?domain=${domain}` : '/api/collaboration/forum'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch forum posts')
      return await response.json()
    } catch (error) {
      console.error('Error fetching forum posts:', error)
      return { posts: [] }
    }
  }

  async createForumPost(postData: Partial<ForumPost>): Promise<ForumPost> {
    try {
      const response = await fetch('/api/collaboration/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      if (!response.ok) throw new Error('Failed to create forum post')
      return await response.json()
    } catch (error) {
      console.error('Error creating forum post:', error)
      throw error
    }
  }

  async createForumReply(postId: string, content: string): Promise<ForumReply> {
    try {
      const response = await fetch(`/api/collaboration/forum/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!response.ok) throw new Error('Failed to create forum reply')
      return await response.json()
    } catch (error) {
      console.error('Error creating forum reply:', error)
      throw error
    }
  }

  // Whiteboard Methods
  async updateWhiteboard(sessionId: string, data: any, version: number): Promise<void> {
    if (!this.socket) return

    this.socket.emit('update-whiteboard', { sessionId, data, version })
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.eventListeners.clear()
    this.currentUser = null
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService()