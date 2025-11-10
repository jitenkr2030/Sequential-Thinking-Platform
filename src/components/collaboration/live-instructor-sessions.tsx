"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Pause, 
  Square, 
  Monitor,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  HandMetal,
  Settings,
  Plus,
  BookOpen
} from "lucide-react"
import { collaborationService, LiveSession, CollaborationUser } from "@/lib/collaboration"

interface LiveInstructorSessionsProps {
  currentUser: CollaborationUser
}

export function LiveInstructorSessions({ currentUser }: LiveInstructorSessionsProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    domain: "",
    scheduledAt: "",
    duration: 60,
    maxParticipants: 50
  })
  const [isInSession, setIsInSession] = useState(false)
  const [sessionControls, setSessionControls] = useState({
    isScreenSharing: false,
    isMuted: false,
    isVideoOff: false,
    isRecording: false
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const domains = [
    "Finance & Accounting",
    "Law", 
    "Medicine",
    "Engineering",
    "Data Science",
    "Business"
  ]

  useEffect(() => {
    loadSessions()
    setupEventListeners()
  }, [])

  useEffect(() => {
    categorizeSessions()
  }, [sessions])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const allSessions = await collaborationService.getLiveSessions()
      setSessions(allSessions)
    } catch (error) {
      console.error("Failed to load live sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupEventListeners = () => {
    collaborationService.on('liveSessionStarted', (session: LiveSession) => {
      setSessions(prev => [...prev, session])
    })

    collaborationService.on('liveSessionEnded', (data: { sessionId: string }) => {
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { ...session, status: 'ended' as const }
          : session
      ))
    })

    collaborationService.on('liveSessionParticipantJoined', (data: { sessionId: string, user: CollaborationUser }) => {
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { 
              ...session, 
              participants: [...session.participants, data.user],
              currentParticipants: session.currentParticipants + 1
            }
          : session
      ))
    })

    collaborationService.on('liveSessionParticipantLeft', (data: { sessionId: string, userId: string }) => {
      setSessions(prev => prev.map(session => 
        session.id === data.sessionId 
          ? { 
              ...session, 
              participants: session.participants.filter(p => p.id !== data.userId),
              currentParticipants: session.currentParticipants - 1
            }
          : session
      ))
    })

    collaborationService.on('whiteboardUpdate', (data: any) => {
      // Handle whiteboard updates
      if (canvasRef.current && data.update) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          // Apply whiteboard update
          ctx.strokeStyle = data.update.color || '#000000'
          ctx.lineWidth = data.update.lineWidth || 2
          ctx.lineCap = 'round'
          
          if (data.update.type === 'draw') {
            ctx.beginPath()
            ctx.moveTo(data.update.fromX, data.update.fromY)
            ctx.lineTo(data.update.toX, data.update.toY)
            ctx.stroke()
          } else if (data.update.type === 'clear') {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }
        }
      }
    })
  }

  const categorizeSessions = () => {
    const now = Date.now()
    
    setUpcomingSessions(sessions.filter(session => 
      session.status === 'scheduled' && session.scheduledAt > now
    ))
    
    setLiveSessions(sessions.filter(session => 
      session.status === 'live' || 
      (session.status === 'scheduled' && 
       session.scheduledAt <= now && 
       session.scheduledAt + (session.duration * 60000) > now)
    ))
    
    setPastSessions(sessions.filter(session => 
      session.status === 'ended' || 
      session.scheduledAt + (session.duration * 60000) <= now
    ))
  }

  const handleCreateSession = async () => {
    try {
      const sessionData = {
        ...newSession,
        scheduledAt: new Date(newSession.scheduledAt).getTime(),
        instructorId: currentUser.id,
        status: 'scheduled' as const,
        currentParticipants: 0,
        participants: [],
        screenShareActive: false
      }

      const createdSession = await collaborationService.createLiveSession(sessionData)
      setSessions(prev => [...prev, createdSession])
      setShowCreateDialog(false)
      setNewSession({
        title: "",
        description: "",
        domain: "",
        scheduledAt: "",
        duration: 60,
        maxParticipants: 50
      })
    } catch (error) {
      console.error("Failed to create live session:", error)
    }
  }

  const handleJoinSession = async (session: LiveSession) => {
    try {
      await collaborationService.joinLiveSession(session.id)
      setSelectedSession(session)
      setShowSessionDialog(true)
      setIsInSession(true)
    } catch (error) {
      console.error("Failed to join live session:", error)
    }
  }

  const handleLeaveSession = async (sessionId: string) => {
    try {
      await collaborationService.leaveLiveSession(sessionId)
      setIsInSession(false)
      setShowSessionDialog(false)
      setSelectedSession(null)
    } catch (error) {
      console.error("Failed to leave live session:", error)
    }
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      await collaborationService.startLiveSession(sessionId)
    } catch (error) {
      console.error("Failed to start live session:", error)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      await collaborationService.endLiveSession(sessionId)
      setIsInSession(false)
      setShowSessionDialog(false)
      setSelectedSession(null)
    } catch (error) {
      console.error("Failed to end live session:", error)
    }
  }

  const toggleScreenShare = () => {
    setSessionControls(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
    // Implement screen sharing logic
  }

  const toggleMute = () => {
    setSessionControls(prev => ({ ...prev, isMuted: !prev.isMuted }))
    // Implement audio mute logic
  }

  const toggleVideo = () => {
    setSessionControls(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))
    // Implement video toggle logic
  }

  const toggleRecording = () => {
    setSessionControls(prev => ({ ...prev, isRecording: !prev.isRecording }))
    // Implement recording logic
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
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

  const getSessionStatus = (session: LiveSession) => {
    const now = Date.now()
    
    if (session.status === 'ended') return 'ended'
    if (session.status === 'live') return 'live'
    if (session.scheduledAt <= now && session.scheduledAt + (session.duration * 60000) > now) {
      return 'live'
    }
    return 'scheduled'
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
          <h2 className="text-2xl font-bold text-gray-900">Live Instructor Sessions</h2>
          <p className="text-gray-600">Join real-time virtual classrooms with expert instructors</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Live Session</DialogTitle>
              <DialogDescription>
                Schedule a new live instructor session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Title</label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter session title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the session content"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Domain</label>
                <select
                  value={newSession.domain}
                  onChange={(e) => setNewSession(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Schedule Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduledAt}
                  onChange={(e) => setNewSession(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="240"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input
                  type="number"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  min="1"
                  max="500"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateSession} className="flex-1">
                  Create Session
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
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{liveSessions.length}</div>
            <div className="text-sm text-gray-600">Live Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{pastSessions.length}</div>
            <div className="text-sm text-gray-600">Past Sessions</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'live' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Live Now ({liveSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'past' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Sessions ({pastSessions.length})
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' && upcomingSessions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-600 mb-4">Check back later for upcoming live sessions</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'live' && liveSessions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Live Sessions</h3>
              <p className="text-gray-600">No sessions are currently live</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'past' && pastSessions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Past Sessions</h3>
              <p className="text-gray-600">No sessions have been completed yet</p>
            </CardContent>
          </Card>
        )}

        {(activeTab === 'upcoming' ? upcomingSessions : 
          activeTab === 'live' ? liveSessions : pastSessions
        ).map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </div>
                <Badge 
                  variant={getSessionStatus(session) === 'live' ? 'default' : 'secondary'}
                  className={getSessionStatus(session) === 'live' ? 'bg-red-600' : ''}
                >
                  {getSessionStatus(session) === 'live' ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      Live
                    </>
                  ) : getSessionStatus(session) === 'upcoming' ? 'Upcoming' : 'Ended'}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {session.domain}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(session.duration)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {session.currentParticipants}/{session.maxParticipants}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Scheduled</span>
                  <span className="font-medium">{formatDateTime(session.scheduledAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {session.participants.slice(0, 5).map((participant) => (
                      <div
                        key={participant.id}
                        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white"
                        title={participant.name}
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {session.currentParticipants > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                        +{session.currentParticipants - 5}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {getSessionStatus(session) === 'live' && (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinSession(session)}
                        disabled={session.currentParticipants >= session.maxParticipants}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                    
                    {getSessionStatus(session) === 'upcoming' && session.instructorId === currentUser.id && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartSession(session.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {getSessionStatus(session) === 'upcoming' && session.instructorId !== currentUser.id && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoinSession(session)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedSession?.title}</DialogTitle>
            <DialogDescription>
              {selectedSession?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              {/* Video Area */}
              <div className="grid grid-cols-3 gap-4 h-96">
                {/* Main Video/Screen Share */}
                <div className="col-span-2 bg-gray-900 rounded-lg relative">
                  {sessionControls.isScreenSharing ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Monitor className="w-16 h-16" />
                      <span className="ml-2">Screen Sharing</span>
                    </div>
                  ) : (
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay
                      muted
                    />
                  )}
                  
                  {/* Session Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleMute}
                      className={sessionControls.isMuted ? 'bg-red-600' : ''}
                    >
                      {sessionControls.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleVideo}
                      className={sessionControls.isVideoOff ? 'bg-red-600' : ''}
                    >
                      {sessionControls.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleScreenShare}
                      className={sessionControls.isScreenSharing ? 'bg-blue-600' : ''}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={toggleRecording}
                      className={sessionControls.isRecording ? 'bg-red-600' : ''}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                    >
                      <HandMetal className="w-4 h-4" />
                    </Button>
                    {selectedSession.instructorId === currentUser.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEndSession(selectedSession.id)}
                      >
                        End Session
                      </Button>
                    )}
                  </div>
                </div>

                {/* Participants List */}
                <div className="bg-gray-100 rounded-lg p-4 overflow-y-auto">
                  <h3 className="font-medium mb-3">Participants ({selectedSession.currentParticipants})</h3>
                  <div className="space-y-2">
                    {selectedSession.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{participant.name}</div>
                          <div className="text-xs text-gray-500">{participant.role}</div>
                        </div>
                        {participant.id === selectedSession.instructorId && (
                          <Badge variant="outline" className="text-xs">Instructor</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Whiteboard */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-2">Whiteboard</h3>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="border rounded cursor-crosshair"
                />
              </div>

              {/* Chat */}
              <div className="bg-gray-50 rounded-lg p-4 h-48">
                <h3 className="font-medium mb-2">Chat</h3>
                <div className="flex-1 overflow-y-auto mb-2 space-y-2">
                  {/* Chat messages would go here */}
                </div>
                <div className="flex space-x-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Leave Button */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleLeaveSession(selectedSession.id)}
                >
                  Leave Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}