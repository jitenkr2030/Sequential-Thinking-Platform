"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  ArrowLeft
} from "lucide-react"
import { collaborationService, StudyGroup, CollaborationUser } from "@/lib/collaboration"
import { StudyGroupSession } from "./study-group-session"

interface StudyGroupsProps {
  currentUser: CollaborationUser
  onGroupSelect?: (group: StudyGroup) => void
}

export function StudyGroups({ currentUser, onGroupSelect }: StudyGroupsProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeSessionGroup, setActiveSessionGroup] = useState<StudyGroup | null>(null)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    domain: "",
    maxMembers: 10,
    isPrivate: false
  })

  const domains = [
    "Finance & Accounting",
    "Law", 
    "Medicine",
    "Engineering",
    "Data Science",
    "Business"
  ]

  useEffect(() => {
    loadGroups()
    setupEventListeners()
  }, [])

  useEffect(() => {
    filterGroups()
  }, [groups, searchTerm, selectedDomain])

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
        isPrivate: false
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
      // For demo purposes, using a default scenario ID
      await collaborationService.startStudyGroupSession(groupId, "default-scenario")
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const handleJoinSession = (group: StudyGroup) => {
    setActiveSessionGroup(group)
  }

  const handleLeaveSession = () => {
    setActiveSessionGroup(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Show active session if any
  if (activeSessionGroup) {
    return (
      <StudyGroupSession
        group={activeSessionGroup}
        currentUser={currentUser}
        onLeave={handleLeaveSession}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
          <p className="text-gray-600">Collaborate with peers in real-time learning sessions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Create a new study group for collaborative learning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                />
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={newGroup.isPrivate}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
                <label htmlFor="private" className="text-sm">Private group</label>
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
                            onClick={() => handleJoinSession(group)}
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
                        {group.currentMembers >= group.maxMembers ? "Full" : "Join"}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleJoinSession(group)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}