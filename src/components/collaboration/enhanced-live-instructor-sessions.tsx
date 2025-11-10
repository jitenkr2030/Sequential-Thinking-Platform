"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  BookOpen,
  ScreenShare,
  StopCircle,
  Circle,
  Triangle,
  Type,
  Eraser,
  Download,
  Upload,
  BarChart,
  PieChart,
  Users2,
  MessageCircle,
  HelpCircle,
  Zap,
  Maximize,
  Minimize,
  ArrowRight,
  Award,
  Bell,
  ThumbsUp,
  ThumbsDown,
  PhoneOff
} from "lucide-react"
import { collaborationService, LiveSession, CollaborationUser } from "@/lib/collaboration"

interface EnhancedLiveInstructorSessionsProps {
  currentUser: CollaborationUser
}

interface SessionParticipant {
  id: string
  name: string
  role: 'instructor' | 'student' | 'ta'
  isSpeaking: boolean
  isMuted: boolean
  isVideoOff: boolean
  raisedHand: boolean
  joinedAt: number
}

interface Poll {
  id: string
  question: string
  options: string[]
  responses: { [key: string]: number }
  isActive: boolean
  createdBy: string
}

interface WhiteboardTool {
  type: 'pen' | 'eraser' | 'text' | 'shape' | 'select'
  color: string
  lineWidth: number
  shape?: 'rectangle' | 'circle' | 'triangle' | 'line'
}

interface BreakoutRoom {
  id: string
  name: string
  participants: string[]
  maxParticipants: number
}

export function EnhancedLiveInstructorSessions({ currentUser }: EnhancedLiveInstructorSessionsProps) {
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
    maxParticipants: 50,
    enableRecording: true,
    enableBreakoutRooms: false,
    enablePolls: true
  })
  const [isInSession, setIsInSession] = useState(false)
  const [sessionControls, setSessionControls] = useState({
    isScreenSharing: false,
    isMuted: false,
    isVideoOff: false,
    isRecording: false,
    currentScreenSource: 'screen' as 'screen' | 'window' | 'tab'
  })
  const [whiteboardTool, setWhiteboardTool] = useState<WhiteboardTool>({
    type: 'pen',
    color: '#000000',
    lineWidth: 2
  })
  const [polls, setPolls] = useState<Poll[]>([])
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newChatMessage, setNewChatMessage] = useState("")
  const [activePoll, setActivePoll] = useState<Poll | null>(null)
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    participants: 0,
    messages: 0,
    polls: 0
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const sessionTimerRef = useRef<NodeJS.Timeout>()

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
        recording: newSession.enableRecording,
        whiteboard: {
          enabled: true,
          data: null
        },
        screenShare: {
          enabled: false,
          streamId: null
        }
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
        maxParticipants: 50,
        enableRecording: true,
        enableBreakoutRooms: false,
        enablePolls: true
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
      
      // Start session timer
      sessionTimerRef.current = setInterval(() => {
        setSessionStats(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
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
      
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    } catch (error) {
      console.error("Failed to leave live session:", error)
    }
  }

  const toggleScreenShare = async (source: 'screen' | 'window' | 'tab' = 'screen') => {
    try {
      if (sessionControls.isScreenSharing) {
        // Stop screen sharing
        setSessionControls(prev => ({ ...prev, isScreenSharing: false }))
      } else {
        // Start screen sharing
        setSessionControls(prev => ({ 
          ...prev, 
          isScreenSharing: true,
          currentScreenSource: source
        }))
      }
    } catch (error) {
      console.error("Failed to toggle screen share:", error)
    }
  }

  const toggleMute = () => {
    setSessionControls(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }

  const toggleVideo = () => {
    setSessionControls(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))
  }

  const toggleRecording = () => {
    setSessionControls(prev => ({ ...prev, isRecording: !prev.isRecording }))
  }

  const createPoll = () => {
    const newPoll: Poll = {
      id: Date.now().toString(),
      question: "What is your understanding of the current topic?",
      options: ["Clear", "Somewhat Clear", "Confused", "Lost"],
      responses: {},
      isActive: true,
      createdBy: currentUser.id
    }
    
    setPolls(prev => [...prev, newPoll])
    setActivePoll(newPoll)
  }

  const respondToPoll = (pollId: string, option: string) => {
    setPolls(prev => prev.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            responses: { ...poll.responses, [option]: (poll.responses[option] || 0) + 1 }
          }
        : poll
    ))
  }

  const createBreakoutRoom = () => {
    const newRoom: BreakoutRoom = {
      id: Date.now().toString(),
      name: `Breakout Room ${breakoutRooms.length + 1}`,
      participants: [],
      maxParticipants: 5
    }
    
    setBreakoutRooms(prev => [...prev, newRoom])
  }

  const sendChatMessage = () => {
    if (!newChatMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newChatMessage,
      timestamp: Date.now(),
      type: 'text'
    }

    setChatMessages(prev => [...prev, message])
    setNewChatMessage("")
    setSessionStats(prev => ({ ...prev, messages: prev.messages + 1 }))
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

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Live Instructor Sessions</h2>
          <p className="text-gray-600">Interactive virtual classrooms with advanced collaboration tools</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Enhanced Live Session</DialogTitle>
              <DialogDescription>
                Schedule a new live instructor session with advanced features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session Title</label>
                  <Input
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter session title"
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

              <div className="grid md:grid-cols-2 gap-4">
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

              <div className="space-y-3">
                <label className="text-sm font-medium">Advanced Features</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSession.enableRecording}
                      onChange={(e) => setNewSession(prev => ({ ...prev, enableRecording: e.target.checked }))}
                    />
                    <span className="text-sm">Enable Recording</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSession.enableBreakoutRooms}
                      onChange={(e) => setNewSession(prev => ({ ...prev, enableBreakoutRooms: e.target.checked }))}
                    />
                    <span className="text-sm">Breakout Rooms</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newSession.enablePolls}
                      onChange={(e) => setNewSession(prev => ({ ...prev, enablePolls: e.target.checked }))}
                    />
                    <span className="text-sm">Live Polls</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateSession} className="flex-1">
                  Create Enhanced Session
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
          activeTab === 'live' ? liveSessions : 
          pastSessions
        ).map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>
                    {session.description}
                  </CardDescription>
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
                {session.recording && (
                  <Badge variant="outline" className="text-xs">
                    <Monitor className="w-3 h-3 mr-1" />
                    Recording
                  </Badge>
                )}
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
                  <Button 
                    onClick={() => handleJoinSession(session)}
                    disabled={getSessionStatus(session) === 'ended' || session.currentParticipants >= session.maxParticipants}
                  >
                    {getSessionStatus(session) === 'live' ? 'Join Live' : 'Register'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedSession.title}</DialogTitle>
                    <DialogDescription>
                      {selectedSession.description} • {selectedSession.domain}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatSessionTime(sessionStats.duration)}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {sessionStats.participants}
                    </Badge>
                    {sessionControls.isRecording && (
                      <Badge variant="destructive">
                        <Monitor className="w-3 h-3 mr-1" />
                        Recording
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex h-[calc(90vh-200px)]">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                  {/* Video/Screen Share Area */}
                  <div className="flex-1 bg-gray-900 relative">
                    {sessionControls.isScreenSharing ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                          <ScreenShare className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg">Screen Share Active</p>
                          <p className="text-sm text-gray-400">Source: {sessionControls.currentScreenSource}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                          <Play className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg">Live Session</p>
                          <p className="text-sm text-gray-400">Instructor will start shortly</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Session Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={sessionControls.isMuted ? "destructive" : "secondary"}
                          onClick={toggleMute}
                        >
                          {sessionControls.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={sessionControls.isVideoOff ? "destructive" : "secondary"}
                          onClick={toggleVideo}
                        >
                          {sessionControls.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={sessionControls.isScreenSharing ? "destructive" : "secondary"}
                          onClick={() => toggleScreenShare()}
                        >
                          {sessionControls.isScreenSharing ? <StopCircle className="w-4 h-4" /> : <ScreenShare className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={sessionControls.isRecording ? "destructive" : "secondary"}
                          onClick={toggleRecording}
                        >
                          {sessionControls.isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={createPoll}>
                          <BarChart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={createBreakoutRoom}>
                          <Users2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleLeaveSession(selectedSession.id)}
                        >
                          <PhoneOff className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration Tools */}
                  <div className="h-64 border-t bg-white">
                    <Tabs defaultValue="whiteboard" className="h-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="polls">Polls</TabsTrigger>
                        <TabsTrigger value="breakout">Breakout</TabsTrigger>
                      </TabsList>

                      <TabsContent value="whiteboard" className="p-4">
                        <div className="h-full flex flex-col">
                          {/* Whiteboard Tools */}
                          <div className="flex items-center space-x-2 mb-4">
                            <Select value={whiteboardTool.type} onValueChange={(value: any) => setWhiteboardTool(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pen">Pen</SelectItem>
                                <SelectItem value="eraser">Eraser</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="shape">Shape</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {whiteboardTool.type === 'shape' && (
                              <Select value={whiteboardTool.shape} onValueChange={(value: any) => setWhiteboardTool(prev => ({ ...prev, shape: value }))}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rectangle">Rectangle</SelectItem>
                                  <SelectItem value="circle">Circle</SelectItem>
                                  <SelectItem value="triangle">Triangle</SelectItem>
                                  <SelectItem value="line">Line</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            <input
                              type="color"
                              value={whiteboardTool.color}
                              onChange={(e) => setWhiteboardTool(prev => ({ ...prev, color: e.target.value }))}
                              className="w-8 h-8 rounded border"
                            />
                            
                            <Select value={whiteboardTool.lineWidth.toString()} onValueChange={(value) => setWhiteboardTool(prev => ({ ...prev, lineWidth: parseInt(value) }))}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1px</SelectItem>
                                <SelectItem value="2">2px</SelectItem>
                                <SelectItem value="4">4px</SelectItem>
                                <SelectItem value="8">8px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Whiteboard Canvas */}
                          <div className="flex-1 border rounded-lg overflow-hidden">
                            <canvas
                              ref={canvasRef}
                              className="w-full h-full cursor-crosshair bg-white"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chat" className="p-4">
                        <div className="h-full flex flex-col">
                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2 bg-gray-50 rounded">
                            {chatMessages.map((message) => (
                              <div key={message.id} className="flex items-start space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                                  {message.userName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{message.userName}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{message.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Chat Input */}
                          <div className="flex space-x-2">
                            <Input
                              value={newChatMessage}
                              onChange={(e) => setNewChatMessage(e.target.value)}
                              placeholder="Type your message..."
                              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                              className="flex-1"
                            />
                            <Button onClick={sendChatMessage}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="polls" className="p-4">
                        <div className="h-full flex flex-col">
                          {activePoll ? (
                            <div className="space-y-4">
                              <h4 className="font-medium">{activePoll.question}</h4>
                              <div className="space-y-2">
                                {activePoll.options.map((option, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                                    <span>{option}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-600 h-2 rounded-full" 
                                          style={{ 
                                            width: `${(activePoll.responses[option] || 0) / Math.max(1, Object.values(activePoll.responses).reduce((a, b) => a + b, 0)) * 100}%` 
                                          }}
                                        />
                                      </div>
                                      <span className="text-sm w-8 text-right">
                                        {activePoll.responses[option] || 0}
                                      </span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => respondToPoll(activePoll.id, option)}
                                    >
                                      Vote
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">No active polls</p>
                              <Button onClick={createPoll} className="mt-4">
                                Create Poll
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="breakout" className="p-4">
                        <div className="h-full flex flex-col">
                          {breakoutRooms.length > 0 ? (
                            <div className="space-y-4">
                              <h4 className="font-medium">Breakout Rooms</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {breakoutRooms.map((room) => (
                                  <Card key={room.id}>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-base">{room.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                          {room.participants.length}/{room.maxParticipants}
                                        </span>
                                        <Button size="sm" variant="outline">
                                          Join
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                              <Button onClick={createBreakoutRoom} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Breakout Room
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">No breakout rooms created</p>
                              <Button onClick={createBreakoutRoom} className="mt-4">
                                Create Breakout Room
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Sidebar - Participants */}
                <div className="w-64 bg-white border-l p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Participants ({sessionStats.participants})
                  </h3>
                  <div className="space-y-2">
                    {Array.from({ length: sessionStats.participants }, (_, i) => (
                      <div key={i} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                            U{i + 1}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            Math.random() > 0.3 ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">User {i + 1}</p>
                          <p className="text-xs text-gray-500">
                            {i === 0 ? 'Instructor' : 'Student'}
                          </p>
                        </div>
                        {Math.random() > 0.7 && (
                          <HandMetal className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    ))}
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