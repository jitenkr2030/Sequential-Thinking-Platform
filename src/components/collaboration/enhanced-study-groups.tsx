"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Plus, 
  Search, 
  Clock, 
  Play, 
  Settings, 
  MessageCircle,
  UserPlus,
  UserMinus,
  Shield,
  Globe,
  BookOpen,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Square,
  Triangle,
  Circle,
  Type,
  Eraser,
  HandMetal,
  Send,
  MoreHorizontal,
  FileText,
  Brain,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Pause,
  SkipForward,
  SkipBack
} from "lucide-react"
import { collaborationService, StudyGroup, CollaborationUser, StudyGroupSession } from "@/lib/collaboration"

interface EnhancedStudyGroupsProps {
  currentUser: CollaborationUser
  onGroupSelect?: (group: StudyGroup) => void
}

interface WhiteboardTool {
  type: 'pen' | 'eraser' | 'text' | 'shape' | 'select'
  color: string
  lineWidth: number
  shape?: 'rectangle' | 'circle' | 'triangle' | 'line'
}

interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'action'
}

interface SessionStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  tools: string[]
  estimatedTime: number
}

export function EnhancedStudyGroups({ currentUser, onGroupSelect }: EnhancedStudyGroupsProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    domain: "",
    maxMembers: 10,
    isPrivate: false,
    enableScreenShare: true,
    enableWhiteboard: true,
    enableRecording: false
  })
  
  // Session state
  const [activeSession, setActiveSession] = useState<StudyGroupSession | null>(null)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    participants: 0,
    messages: 0,
    stepsCompleted: 0
  })
  
  // Whiteboard state
  const [whiteboardTool, setWhiteboardTool] = useState<WhiteboardTool>({
    type: 'pen',
    color: '#000000',
    lineWidth: 2
  })
  const [isDrawing, setIsDrawing] = useState(false)
  
  // Controls state
  const [sessionControls, setSessionControls] = useState({
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isRecording: false
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionTimerRef = useRef<NodeJS.Timeout>()

  const domains = [
    "Finance & Accounting",
    "Law", 
    "Medicine",
    "Engineering",
    "Data Science",
    "Business"
  ]

  const sessionSteps: SessionStep[] = [
    {
      id: "1",
      title: "Problem Identification",
      description: "Clearly define the problem or question to be addressed",
      isCompleted: false,
      tools: ["Analysis", "Research"],
      estimatedTime: 5
    },
    {
      id: "2",
      title: "Information Gathering",
      description: "Collect relevant data and information",
      isCompleted: false,
      tools: ["Research", "Data Analysis"],
      estimatedTime: 10
    },
    {
      id: "3",
      title: "Analysis & Reasoning",
      description: "Apply logical reasoning and analytical tools",
      isCompleted: false,
      tools: ["Logic", "Critical Thinking"],
      estimatedTime: 15
    },
    {
      id: "4",
      title: "Solution Development",
      description: "Develop and evaluate potential solutions",
      isCompleted: false,
      tools: ["Problem Solving", "Creativity"],
      estimatedTime: 10
    },
    {
      id: "5",
      title: "Conclusion & Review",
      description: "Finalize conclusions and review the reasoning process",
      isCompleted: false,
      tools: ["Synthesis", "Evaluation"],
      estimatedTime: 5
    }
  ]

  useEffect(() => {
    loadGroups()
    setupEventListeners()
  }, [])

  useEffect(() => {
    filterGroups()
  }, [groups, searchTerm, selectedDomain])

  useEffect(() => {
    scrollToBottom()
  }, [sessionMessages])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const allGroups = await collaborationService.getStudyGroups()
      setGroups(allGroups)
    } catch (error) {
      console.error("Failed to load study groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupEventListeners = () => {
    collaborationService.on('studyGroupCreated', (group: StudyGroup) => {
      setGroups(prev => [...prev, group])
    })

    collaborationService.on('studyGroupJoined', (data: { groupId: string, user: CollaborationUser }) => {
      setGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, members: [...group.members, data.user], currentMembers: group.currentMembers + 1 }
          : group
      ))
    })

    collaborationService.on('studyGroupLeft', (data: { groupId: string, userId: string }) => {
      setGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { 
              ...group, 
              members: group.members.filter(m => m.id !== data.userId),
              currentMembers: group.currentMembers - 1
            }
          : group
      ))
    })

    collaborationService.on('studyGroupSessionStarted', (data: { groupId: string, sessionId: string }) => {
      setGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, activeSession: { id: data.sessionId, scenarioId: "", startedAt: Date.now(), participants: [] } }
          : group
      ))
    })

    collaborationService.on('studyGroupSessionEnded', (data: { groupId: string }) => {
      setGroups(prev => prev.map(group => 
        group.id === data.groupId 
          ? { ...group, activeSession: undefined }
          : group
      ))
    })

    collaborationService.on('studyGroupMessage', (message: ChatMessage) => {
      setSessionMessages(prev => [...prev, message])
      setSessionStats(prev => ({ ...prev, messages: prev.messages + 1 }))
    })
  }

  const filterGroups = () => {
    let filtered = groups

    if (searchTerm) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDomain !== "all") {
      filtered = filtered.filter(group => group.domain === selectedDomain)
    }

    setFilteredGroups(filtered)
  }

  const handleCreateGroup = async () => {
    try {
      const groupData = {
        ...newGroup,
        createdBy: currentUser.id,
        createdAt: Date.now(),
        members: [currentUser],
        currentMembers: 1
      }

      const createdGroup = await collaborationService.createStudyGroup(groupData)
      setGroups(prev => [...prev, createdGroup])
      setShowCreateDialog(false)
      setNewGroup({
        name: "",
        description: "",
        domain: "",
        maxMembers: 10,
        isPrivate: false,
        enableScreenShare: true,
        enableWhiteboard: true,
        enableRecording: false
      })
    } catch (error) {
      console.error("Failed to create study group:", error)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await collaborationService.joinStudyGroup(groupId)
    } catch (error) {
      console.error("Failed to join study group:", error)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await collaborationService.leaveStudyGroup(groupId)
    } catch (error) {
      console.error("Failed to leave study group:", error)
    }
  }

  const handleStartSession = async (groupId: string) => {
    try {
      const sessionId = await collaborationService.startStudyGroupSession(groupId, "enhanced-scenario")
      
      // Initialize session state
      const session: StudyGroupSession = {
        id: sessionId,
        groupId,
        scenarioId: "enhanced-scenario",
        status: 'active',
        startedAt: Date.now(),
        participants: [currentUser],
        currentStep: 0,
        chatMessages: []
      }
      
      setActiveSession(session)
      setShowSessionDialog(true)
      setCurrentStep(0)
      setSessionMessages([])
      
      // Start session timer
      sessionTimerRef.current = setInterval(() => {
        setSessionStats(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const handleEndSession = async () => {
    try {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
      
      setActiveSession(null)
      setShowSessionDialog(false)
      setSelectedGroup(null)
      
      // Reset session state
      setSessionStats({
        duration: 0,
        participants: 0,
        messages: 0,
        stepsCompleted: 0
      })
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return

    try {
      await collaborationService.sendStudyGroupMessage(activeSession.id, newMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const completeStep = (stepIndex: number) => {
    const updatedSteps = sessionSteps.map((step, index) => 
      index === stepIndex ? { ...step, isCompleted: true } : step
    )
    
    setCurrentStep(stepIndex + 1)
    setSessionStats(prev => ({ ...prev, stepsCompleted: prev.stepsCompleted + 1 }))
  }

  // Whiteboard functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.strokeStyle = whiteboardTool.color
    ctx.lineWidth = whiteboardTool.lineWidth
    ctx.lineCap = 'round'
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    ctx.beginPath()
    setIsDrawing(false)
  }

  const clearWhiteboard = () => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleMute = () => {
    setSessionControls(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }

  const toggleVideo = () => {
    setSessionControls(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))
  }

  const toggleScreenShare = () => {
    setSessionControls(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
  }

  const toggleRecording = () => {
    setSessionControls(prev => ({ ...prev, isRecording: !prev.isRecording }))
  }

  const isMember = (group: StudyGroup) => {
    return group.members.some(member => member.id === currentUser.id)
  }

  const isCreator = (group: StudyGroup) => {
    return group.createdBy === currentUser.id
  }

  const getMemberStatus = (group: StudyGroup) => {
    if (isMember(group)) {
      return isCreator(group) ? "Creator" : "Member"
    }
    return group.currentMembers >= group.maxMembers ? "Full" : "Available"
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
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Study Groups</h2>
          <p className="text-gray-600">Real-time collaborative learning with advanced features</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Enhanced Study Group</DialogTitle>
              <DialogDescription>
                Create a new study group with real-time collaboration features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Domain</label>
                  <select
                    value={newGroup.domain}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, domain: e.target.value }))}
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
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the group's purpose"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Members</label>
                  <Input
                    type="number"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    min="2"
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Group Type</label>
                  <select
                    value={newGroup.isPrivate ? "private" : "public"}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.value === "private" }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Collaboration Features</label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newGroup.enableScreenShare}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, enableScreenShare: e.target.checked }))}
                    />
                    <span className="text-sm">Enable Screen Sharing</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newGroup.enableWhiteboard}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, enableWhiteboard: e.target.checked }))}
                    />
                    <span className="text-sm">Enable Whiteboard</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newGroup.enableRecording}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, enableRecording: e.target.checked }))}
                    />
                    <span className="text-sm">Enable Recording</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateGroup} className="flex-1">
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search groups..."
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
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No study groups found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedDomain !== "all" 
                ? "Try adjusting your search or filters"
                : "Be the first to create a study group!"
              }
            </p>
            {!searchTerm && selectedDomain === "all" && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {group.description}
                    </CardDescription>
                  </div>
                  {group.isPrivate && (
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {group.domain}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {group.currentMembers}/{group.maxMembers}
                  </Badge>
                  {group.activeSession && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <Play className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Members */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Members</span>
                      <span>{group.currentMembers}/{group.maxMembers}</span>
                    </div>
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white"
                          title={member.name}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {group.currentMembers > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                          +{group.currentMembers - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Features</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        <ScreenShare className="w-3 h-3 mr-1" />
                        Screen
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Board
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat
                      </Badge>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge 
                      variant={getMemberStatus(group) === "Available" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {getMemberStatus(group)}
                    </Badge>
                  </div>

                  {/* Created */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-500">{formatTimeAgo(group.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {isMember(group) ? (
                      <>
                        {group.activeSession ? (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedGroup(group)
                              setShowSessionDialog(true)
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Join Session
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleStartSession(group.id)}
                            disabled={!isCreator(group)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start Session
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleLeaveGroup(group.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.currentMembers >= group.maxMembers}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join Group
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          {selectedGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedGroup.name} - Live Session</DialogTitle>
                    <DialogDescription>
                      Collaborative reasoning session in progress
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
                  </div>
                </div>
              </DialogHeader>

              <div className="flex h-[70vh]">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                  <Tabs defaultValue="whiteboard" className="flex-1">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                      <TabsTrigger value="steps">Reasoning Steps</TabsTrigger>
                      <TabsTrigger value="tools">Collaboration Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="whiteboard" className="flex-1 p-4">
                      <div className="h-full flex flex-col">
                        {/* Whiteboard Toolbar */}
                        <div className="flex items-center space-x-2 p-2 border-b">
                          <Button
                            size="sm"
                            variant={whiteboardTool.type === 'pen' ? 'default' : 'outline'}
                            onClick={() => setWhiteboardTool(prev => ({ ...prev, type: 'pen' }))}
                          >
                            <Type className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={whiteboardTool.type === 'eraser' ? 'default' : 'outline'}
                            onClick={() => setWhiteboardTool(prev => ({ ...prev, type: 'eraser' }))}
                          >
                            <Eraser className="w-4 h-4" />
                          </Button>
                          <input
                            type="color"
                            value={whiteboardTool.color}
                            onChange={(e) => setWhiteboardTool(prev => ({ ...prev, color: e.target.value }))}
                            className="w-8 h-8 border rounded"
                          />
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={whiteboardTool.lineWidth}
                            onChange={(e) => setWhiteboardTool(prev => ({ ...prev, lineWidth: parseInt(e.target.value) }))}
                            className="w-20"
                          />
                          <Button size="sm" variant="outline" onClick={clearWhiteboard}>
                            <Square className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Whiteboard Canvas */}
                        <div className="flex-1 border rounded-lg overflow-hidden">
                          <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="w-full h-full cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="steps" className="flex-1 p-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Sequential Reasoning Steps</h3>
                        <div className="space-y-3">
                          {sessionSteps.map((step, index) => (
                            <Card 
                              key={step.id} 
                              className={`transition-all ${index === currentStep ? 'ring-2 ring-blue-500' : ''} ${step.isCompleted ? 'bg-green-50' : ''}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Badge variant={step.isCompleted ? 'default' : 'outline'}>
                                        Step {index + 1}
                                      </Badge>
                                      {step.isCompleted && (
                                        <Badge variant="default" className="bg-green-600">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Completed
                                        </Badge>
                                      )}
                                    </div>
                                    <h4 className="font-medium">{step.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="text-xs text-gray-500">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {step.estimatedTime} min
                                      </span>
                                      <div className="flex space-x-1">
                                        {step.tools.map(tool => (
                                          <Badge key={tool} variant="outline" className="text-xs">
                                            {tool}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  {index === currentStep && !step.isCompleted && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => completeStep(index)}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tools" className="flex-1 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Screen Sharing</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Button 
                                className="w-full"
                                onClick={toggleScreenShare}
                                variant={sessionControls.isScreenSharing ? 'default' : 'outline'}
                              >
                                <ScreenShare className="w-4 h-4 mr-2" />
                                {sessionControls.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                              </Button>
                              <p className="text-sm text-gray-600">
                                Share your screen with the group for collaborative analysis
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Audio/Video</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Button 
                                className="w-full"
                                onClick={toggleMute}
                                variant={sessionControls.isMuted ? 'default' : 'outline'}
                              >
                                {sessionControls.isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                                {sessionControls.isMuted ? 'Unmute' : 'Mute'}
                              </Button>
                              <Button 
                                className="w-full"
                                onClick={toggleVideo}
                                variant={sessionControls.isVideoOff ? 'default' : 'outline'}
                              >
                                {sessionControls.isVideoOff ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                                {sessionControls.isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Recording</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Button 
                                className="w-full"
                                onClick={toggleRecording}
                                variant={sessionControls.isRecording ? 'default' : 'outline'}
                              >
                                <Square className="w-4 h-4 mr-2" />
                                {sessionControls.isRecording ? 'Stop Recording' : 'Start Recording'}
                              </Button>
                              <p className="text-sm text-gray-600">
                                Record the session for later review and analysis
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Session Controls</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Button 
                                className="w-full"
                                variant="outline"
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                              >
                                <SkipBack className="w-4 h-4 mr-2" />
                                Previous Step
                              </Button>
                              <Button 
                                className="w-full"
                                variant="outline"
                                onClick={() => setCurrentStep(Math.min(sessionSteps.length - 1, currentStep + 1))}
                                disabled={currentStep === sessionSteps.length - 1}
                              >
                                <SkipForward className="w-4 h-4 mr-2" />
                                Next Step
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Chat Sidebar */}
                <div className="w-80 border-l flex flex-col">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Group Chat</h3>
                    <p className="text-sm text-gray-600">{sessionMessages.length} messages</p>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {sessionMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        sessionMessages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-3 rounded-lg ${
                              message.userId === currentUser.id 
                                ? 'bg-blue-50 ml-8' 
                                : 'bg-gray-50 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{message.userName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Footer */}
              <div className="flex items-center justify-between p-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Session: {formatSessionTime(sessionStats.duration)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {sessionSteps.length}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleEndSession}>
                    <Square className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}