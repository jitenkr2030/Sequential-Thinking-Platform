"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  PhoneOff,
  Share2,
  Pencil,
  MousePointer,
  Maximize,
  Minimize,
  Clock,
  Target,
  Lightbulb,
  Send,
  MoreHorizontal,
  UserPlus,
  Settings
} from "lucide-react"
import { collaborationService, StudyGroup, CollaborationUser } from "@/lib/collaboration"

interface StudyGroupSessionProps {
  group: StudyGroup
  currentUser: CollaborationUser
  onLeave: () => void
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'action'
}

interface WhiteboardAction {
  type: 'draw' | 'erase' | 'clear'
  x?: number
  y?: number
  color?: string
  lineWidth?: number
}

export function StudyGroupSession({ group, currentUser, onLeave }: StudyGroupSessionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [activeTool, setActiveTool] = useState<'pencil' | 'eraser'>('pencil')
  const [whiteboardColor, setWhiteboardColor] = useState("#000000")
  const [whiteboardLineWidth, setWhiteboardLineWidth] = useState(2)
  const [sessionTime, setSessionTime] = useState(0)
  const [participants, setParticipants] = useState<CollaborationUser[]>(group.members)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Initialize session
    initializeSession()
    setupEventListeners()
    
    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeSession = () => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      content: `Welcome to ${group.name} study session!`,
      timestamp: Date.now(),
      type: 'system'
    }
    setMessages([welcomeMessage])
  }

  const setupEventListeners = () => {
    // Listen for chat messages
    collaborationService.on('studyGroupMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for participant changes
    collaborationService.on('userJoinedSession', (data: any) => {
      setParticipants(prev => [...prev, data.user])
      
      const joinMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        content: `${data.user.name} joined the session`,
        timestamp: Date.now(),
        type: 'system'
      }
      setMessages(prev => [...prev, joinMessage])
    })

    collaborationService.on('userLeftSession', (data: any) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId))
      
      const leaveMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        content: `A participant left the session`,
        timestamp: Date.now(),
        type: 'system'
      }
      setMessages(prev => [...prev, leaveMessage])
    })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    }

    // Send message via collaboration service
    collaborationService.sendStudyGroupMessage(group.activeSession?.id || '', newMessage)
    
    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const handleWhiteboardAction = (action: WhiteboardAction) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    switch (action.type) {
      case 'draw':
        if (action.x !== undefined && action.y !== undefined) {
          ctx.strokeStyle = whiteboardColor
          ctx.lineWidth = whiteboardLineWidth
          ctx.lineCap = 'round'
          ctx.lineTo(action.x, action.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(action.x, action.y)
        }
        break
      case 'erase':
        if (action.x !== undefined && action.y !== undefined) {
          ctx.globalCompositeOperation = 'destination-out'
          ctx.lineWidth = whiteboardLineWidth * 2
          ctx.lineTo(action.x, action.y)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(action.x, action.y)
          ctx.globalCompositeOperation = 'source-over'
        }
        break
      case 'clear':
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        break
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getParticipantStatus = (participant: CollaborationUser) => {
    // Mock online status - in real implementation, this would come from presence system
    return Math.random() > 0.3 ? 'online' : 'away'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-semibold">{group.name}</h1>
              <p className="text-sm text-gray-600">{group.description}</p>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(sessionTime)}</span>
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{participants.length}</span>
            </Badge>
            <Button size="sm" variant="outline" onClick={onLeave}>
              <PhoneOff className="w-4 h-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Participants */}
        <div className="w-64 bg-white border-r p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Participants ({participants.length})
          </h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    getParticipantStatus(participant) === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.name}</p>
                  <p className="text-xs text-gray-500">{participant.role}</p>
                </div>
                {participant.id === currentUser.id && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="whiteboard" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tools">Collaboration Tools</TabsTrigger>
            </TabsList>

            {/* Whiteboard Tab */}
            <TabsContent value="whiteboard" className="flex-1 p-4">
              <div className="h-full flex flex-col">
                {/* Whiteboard Toolbar */}
                <div className="flex items-center space-x-4 p-3 bg-white border-b mb-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={activeTool === 'pencil' ? 'default' : 'outline'}
                      onClick={() => setActiveTool('pencil')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTool === 'eraser' ? 'default' : 'outline'}
                      onClick={() => setActiveTool('eraser')}
                    >
                      <MousePointer className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={whiteboardColor}
                      onChange={(e) => setWhiteboardColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                    <select
                      value={whiteboardLineWidth}
                      onChange={(e) => setWhiteboardLineWidth(parseInt(e.target.value))}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="1">Thin</option>
                      <option value="2">Medium</option>
                      <option value="4">Thick</option>
                    </select>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleWhiteboardAction({ type: 'clear' })}>
                    Clear
                  </Button>
                </div>

                {/* Whiteboard Canvas */}
                <div className="flex-1 bg-white border rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top
                      handleWhiteboardAction({ type: activeTool, x, y, color: whiteboardColor, lineWidth: whiteboardLineWidth })
                    }}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) { // Only when mouse is pressed
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const y = e.clientY - rect.top
                        handleWhiteboardAction({ type: activeTool, x, y, color: whiteboardColor, lineWidth: whiteboardLineWidth })
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-4">
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-white border rounded-lg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.type === 'system'
                            ? 'bg-gray-100 text-gray-600 text-sm'
                            : message.userId === currentUser.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {message.type !== 'system' && (
                          <div className="text-xs opacity-75 mb-1">{message.userName}</div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-50 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Collaboration Tools Tab */}
            <TabsContent value="tools" className="flex-1 p-4">
              <div className="space-y-6">
                {/* Audio/Video Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Audio & Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={isMuted ? "destructive" : "outline"}
                        onClick={() => setIsMuted(!isMuted)}
                        className="flex items-center space-x-2"
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        <span>{isMuted ? "Unmute" : "Mute"}</span>
                      </Button>
                      <Button
                        variant={isVideoOff ? "destructive" : "outline"}
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className="flex items-center space-x-2"
                      >
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        <span>{isVideoOff ? "Turn On Video" : "Turn Off Video"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Screen Sharing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Screen Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={isScreenSharing ? "destructive" : "outline"}
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className="flex items-center space-x-2"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recording */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recording</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={() => setIsRecording(!isRecording)}
                      className="flex items-center space-x-2"
                    >
                      <Target className="w-4 h-4" />
                      <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Session Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Group:</span>
                      <span className="text-sm font-medium">{group.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Domain:</span>
                      <span className="text-sm font-medium">{group.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{formatTime(sessionTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Participants:</span>
                      <span className="text-sm font-medium">{participants.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}