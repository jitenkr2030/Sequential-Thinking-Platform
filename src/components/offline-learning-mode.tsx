"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  WifiOff, 
  Download, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Brain,
  Target,
  BarChart3
} from "lucide-react"
import { useOffline } from "@/hooks/use-offline"

interface OfflineLearningModeProps {
  onBack: () => void
}

interface LearningSession {
  mapId: string
  currentStep: number
  startTime: number
  progress: number
  completed: boolean
}

export function OfflineLearningMode({ onBack }: OfflineLearningModeProps) {
  const {
    downloadedMaps,
    getReasoningMap,
    saveProgress,
    isOnline,
    syncStatus
  } = useOffline()

  const [selectedMap, setSelectedMap] = useState<any>(null)
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null)
  const [loading, setLoading] = useState(false)

  // Load saved session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('offlineLearningSession')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setCurrentSession(session)
        // Load the map for the saved session
        loadMap(session.mapId)
      } catch (error) {
        console.error('Failed to load saved session:', error)
      }
    }
  }, [])

  const loadMap = async (mapId: string) => {
    setLoading(true)
    try {
      const map = await getReasoningMap(mapId)
      if (map) {
        setSelectedMap(map)
      } else {
        console.error('Map not found offline')
      }
    } catch (error) {
      console.error('Failed to load map:', error)
    } finally {
      setLoading(false)
    }
  }

  const startLearningSession = (map: any) => {
    const session: LearningSession = {
      mapId: map.id,
      currentStep: 0,
      startTime: Date.now(),
      progress: 0,
      completed: false
    }
    setCurrentSession(session)
    localStorage.setItem('offlineLearningSession', JSON.stringify(session))
    setSelectedMap(map)
  }

  const updateSessionProgress = async (step: number, completed: boolean = false) => {
    if (!currentSession) return

    const updatedSession: LearningSession = {
      ...currentSession,
      currentStep: step,
      progress: Math.round((step / (selectedMap?.scenarios?.length || 1)) * 100),
      completed
    }

    setCurrentSession(updatedSession)
    localStorage.setItem('offlineLearningSession', JSON.stringify(updatedSession))

    // Save progress
    await saveProgress({
      type: 'offline_learning',
      mapId: selectedMap.id,
      step,
      progress: updatedSession.progress,
      completed,
      timestamp: Date.now(),
      duration: Date.now() - updatedSession.startTime
    })
  }

  const nextStep = async () => {
    if (!currentSession || !selectedMap) return

    const nextStep = currentSession.currentStep + 1
    const completed = nextStep >= (selectedMap.scenarios?.length || 0)
    
    await updateSessionProgress(nextStep, completed)
  }

  const previousStep = async () => {
    if (!currentSession || currentSession.currentStep <= 0) return
    await updateSessionProgress(currentSession.currentStep - 1)
  }

  const resetSession = () => {
    setCurrentSession(null)
    setSelectedMap(null)
    localStorage.removeItem('offlineLearningSession')
  }

  const getCurrentScenario = () => {
    if (!selectedMap || !currentSession) return null
    return selectedMap.scenarios?.[currentSession.currentStep]
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offline content...</p>
        </div>
      </div>
    )
  }

  if (selectedMap && currentSession) {
    const currentScenario = getCurrentScenario()
    const sessionDuration = Date.now() - currentSession.startTime

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={resetSession}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{selectedMap.title}</h1>
                  <p className="text-sm text-gray-600">{selectedMap.domain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
                <Badge variant="secondary">
                  {currentSession.progress}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Step {currentSession.currentStep + 1} of {selectedMap.scenarios?.length || 0}
              </span>
              <span className="text-sm text-gray-600">
                {formatDuration(sessionDuration)}
              </span>
            </div>
            <Progress value={currentSession.progress} className="h-2" />
          </div>
        </div>

        {/* Learning Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {currentScenario ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-600" />
                    {currentScenario.title}
                  </CardTitle>
                  <CardDescription>
                    {currentScenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scenario Content */}
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Scenario:</h4>
                      <p className="text-gray-700">{currentScenario.content}</p>
                    </div>

                    {/* Reasoning Steps */}
                    {currentScenario.steps && (
                      <div>
                        <h4 className="font-medium mb-3">Reasoning Steps:</h4>
                        <div className="space-y-3">
                          {currentScenario.steps.map((step: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4">
                              <h5 className="font-medium text-sm">Step {index + 1}</h5>
                              <p className="text-gray-600 text-sm">{step.description}</p>
                              {step.tools && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Tools: </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {step.tools.map((tool: string, toolIndex: number) => (
                                      <Badge key={toolIndex} variant="outline" className="text-xs">
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practice Questions */}
                    {currentScenario.questions && (
                      <div>
                        <h4 className="font-medium mb-3">Practice Questions:</h4>
                        <div className="space-y-3">
                          {currentScenario.questions.map((question: any, index: number) => (
                            <div key={index} className="bg-blue-50 p-3 rounded-lg">
                              <p className="font-medium text-sm mb-2">{question.text}</p>
                              {question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option: string, optionIndex: number) => (
                                    <label key={optionIndex} className="flex items-center space-x-2 text-sm">
                                      <input type="radio" name={`question-${index}`} className="rounded" />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentSession.currentStep === 0}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Target className="w-4 h-4" />
                      <span>Think through each step carefully</span>
                    </div>

                    <Button
                      onClick={nextStep}
                      disabled={currentSession.completed}
                    >
                      {currentSession.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          Next
                          <Play className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Learning Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    You have successfully completed all scenarios in this reasoning map.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Total time: {formatDuration(sessionDuration)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Progress: {currentSession.progress}%
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-6">
                    <Button onClick={resetSession} variant="outline">
                      Choose Different Map
                    </Button>
                    <Button onClick={() => startLearningSession(selectedMap)}>
                      Restart Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Offline Learning Mode</h1>
                <p className="text-sm text-gray-600">Continue learning without internet connection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
              <Badge variant="secondary">
                {downloadedMaps.length} Maps Available
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {downloadedMaps.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Available Offline</h3>
                <p className="text-gray-600 mb-4">
                  You need to download reasoning maps while online to use them offline.
                </p>
                <Button onClick={onBack} variant="outline">
                  Go Back to Download Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloadedMaps.map((map) => {
                const lastAccessed = new Date(map.lastAccessed).toLocaleDateString()
                
                return (
                  <Card key={map.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {map.domain}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {map.scenarios?.length || 0} steps
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{map.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Last accessed: {lastAccessed}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {map.description}
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => startLearningSession(map)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}