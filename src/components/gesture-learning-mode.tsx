"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TouchHeader, TouchButton } from "@/components/ui/touch-navigation"
import { SwipeableDeck } from "@/components/ui/swipeable-card"
import { useSwipeNavigation, useTap } from "@/hooks/use-gestures"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Brain, 
  Target,
  BookOpen,
  RotateCcw,
  Home,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from "lucide-react"

interface GestureLearningModeProps {
  scenarios: Array<{
    id: string
    title: string
    description: string
    content: string
    steps: Array<{
      description: string
      tools?: string[]
      hints?: string[]
    }>
    questions?: Array<{
      text: string
      options?: string[]
      type: 'multiple-choice' | 'true-false' | 'open-ended'
    }>
  }>
  onComplete?: (progress: any) => void
  onExit?: () => void
  domain: string
}

interface LearningState {
  currentScenarioIndex: number
  currentStepIndex: number
  startTime: number
  completedSteps: number
  totalSteps: number
  showHint: boolean
  userAnswers: Record<string, any>
  feedback: Record<string, string>
}

export function GestureLearningMode({ 
  scenarios, 
  onComplete, 
  onExit, 
  domain 
}: GestureLearningModeProps) {
  const [state, setState] = useState<LearningState>({
    currentScenarioIndex: 0,
    currentStepIndex: 0,
    startTime: Date.now(),
    completedSteps: 0,
    totalSteps: scenarios.reduce((total, scenario) => total + scenario.steps.length, 0),
    showHint: false,
    userAnswers: {},
    feedback: {}
  })

  const [showFeedback, setShowFeedback] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState("")

  const currentScenario = scenarios[state.currentScenarioIndex]
  const currentStep = currentScenario?.steps[state.currentStepIndex]
  const progress = (state.completedSteps / state.totalSteps) * 100

  // Swipe navigation between steps
  const handleSwipeLeft = () => {
    nextStep()
  }

  const handleSwipeRight = () => {
    previousStep()
  }

  const swipeProps = useSwipeNavigation(
    handleSwipeRight,
    handleSwipeLeft,
    undefined,
    undefined,
    { swipeThreshold: 40 }
  )

  const nextStep = () => {
    if (state.currentStepIndex < currentScenario.steps.length - 1) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        showHint: false
      }))
    } else {
      nextScenario()
    }
  }

  const previousStep = () => {
    if (state.currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
        showHint: false
      }))
    } else if (state.currentScenarioIndex > 0) {
      previousScenario()
    }
  }

  const nextScenario = () => {
    if (state.currentScenarioIndex < scenarios.length - 1) {
      setState(prev => ({
        ...prev,
        currentScenarioIndex: prev.currentScenarioIndex + 1,
        currentStepIndex: 0,
        showHint: false
      }))
    } else {
      completeLearning()
    }
  }

  const previousScenario = () => {
    if (state.currentScenarioIndex > 0) {
      const prevScenario = scenarios[state.currentScenarioIndex - 1]
      setState(prev => ({
        ...prev,
        currentScenarioIndex: prev.currentScenarioIndex - 1,
        currentStepIndex: prevScenario.steps.length - 1,
        showHint: false
      }))
    }
  }

  const completeLearning = () => {
    const duration = Date.now() - state.startTime
    const progress = {
      completedSteps: state.totalSteps,
      totalSteps: state.totalSteps,
      duration,
      accuracy: calculateAccuracy(),
      domain
    }
    
    onComplete?.(progress)
  }

  const calculateAccuracy = () => {
    const answers = Object.values(state.userAnswers)
    if (answers.length === 0) return 0
    
    const correct = answers.filter(answer => answer === true).length
    return Math.round((correct / answers.length) * 100)
  }

  const handleAnswer = (questionId: string, answer: any, isCorrect?: boolean) => {
    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [questionId]: answer
      },
      feedback: {
        ...prev.feedback,
        [questionId]: isCorrect ? "Correct!" : "Let's think about this..."
      }
    }))

    if (isCorrect !== undefined) {
      setCurrentFeedback(isCorrect ? "Correct! Great job!" : "Not quite. Let's review the reasoning steps.")
      setShowFeedback(true)
      
      setTimeout(() => {
        setShowFeedback(false)
        setCurrentFeedback("")
      }, 2000)
    }
  }

  const toggleHint = () => {
    setState(prev => ({ ...prev, showHint: !prev.showHint }))
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getStepProgress = () => {
    const scenarioProgress = ((state.currentStepIndex + 1) / currentScenario.steps.length) * 100
    const overallProgress = ((state.completedSteps + state.currentStepIndex + 1) / state.totalSteps) * 100
    return { scenarioProgress, overallProgress }
  }

  const { scenarioProgress, overallProgress } = getStepProgress()

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Learning Complete!</h3>
            <p className="text-gray-600 mb-4">
              You've completed all scenarios for {domain}.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>Total time: {formatTime(Date.now() - state.startTime)}</p>
              <p>Accuracy: {calculateAccuracy()}%</p>
            </div>
            <div className="flex space-x-2">
              <TouchButton onClick={onExit} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Exit
              </TouchButton>
              <TouchButton onClick={() => window.location.reload()}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </TouchButton>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <TouchHeader
        title={`${domain} Learning`}
        subtitle={`${state.currentScenarioIndex + 1} of ${scenarios.length}`}
        onBack={onExit}
        actions={
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(overallProgress)}%
            </Badge>
          </div>
        }
      />

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {state.currentStepIndex + 1} of {currentScenario.steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {formatTime(Date.now() - state.startTime)}
            </span>
          </div>
          <Progress value={scenarioProgress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={swipeProps.elementRef}
        className="container mx-auto px-4 py-6"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Scenario Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl leading-tight mb-2">
                    {currentScenario.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {currentScenario.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-4">
                  {state.currentScenarioIndex + 1}/{scenarios.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step Content */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-blue-600" />
                  Step {state.currentStepIndex + 1}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {currentStep.description}
                </p>
                
                {/* Tools */}
                {currentStep.tools && currentStep.tools.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Relevant Tools:</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentStep.tools.map((tool, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {state.showHint && currentStep.hints && currentStep.hints.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Hint:
                    </h5>
                    <p className="text-sm text-blue-700">
                      {currentStep.hints[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Questions */}
              {currentStep.questions && (
                <div className="space-y-4">
                  {currentStep.questions.map((question, qIndex) => (
                    <Card key={qIndex} className="border-blue-200">
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-3">{question.text}</h5>
                        
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => {
                              const answerKey = `${state.currentScenarioIndex}-${state.currentStepIndex}-${qIndex}`
                              const userAnswer = state.userAnswers[answerKey]
                              
                              return (
                                <button
                                  key={oIndex}
                                  onClick={() => handleAnswer(answerKey, option)}
                                  className={`
                                    w-full text-left p-3 rounded-lg border transition-all
                                    ${userAnswer === option 
                                      ? 'border-blue-500 bg-blue-50' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  {option}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {question.type === 'true-false' && (
                          <div className="flex space-x-3">
                            <TouchButton
                              variant={state.userAnswers[`${state.currentScenarioIndex}-${state.currentStepIndex}-${qIndex}`] === true ? "default" : "outline"}
                              onClick={() => handleAnswer(`${state.currentScenarioIndex}-${state.currentStepIndex}-${qIndex}`, true)}
                              className="flex-1"
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              True
                            </TouchButton>
                            <TouchButton
                              variant={state.userAnswers[`${state.currentScenarioIndex}-${state.currentStepIndex}-${qIndex}`] === false ? "default" : "outline"}
                              onClick={() => handleAnswer(`${state.currentScenarioIndex}-${state.currentStepIndex}-${qIndex}`, false)}
                              className="flex-1"
                            >
                              <ThumbsDown className="w-4 h-4 mr-2" />
                              False
                            </TouchButton>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <TouchButton
                  variant="outline"
                  onClick={previousStep}
                  disabled={state.currentScenarioIndex === 0 && state.currentStepIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </TouchButton>

                <div className="flex items-center space-x-2">
                  <TouchButton
                    variant="ghost"
                    size="sm"
                    onClick={toggleHint}
                    disabled={!currentStep.hints || currentStep.hints.length === 0}
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    {state.showHint ? 'Hide' : 'Hint'}
                  </TouchButton>
                </div>

                <TouchButton
                  onClick={nextStep}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </TouchButton>
              </div>
            </CardContent>
          </Card>

          {/* Swipe Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-blue-800">
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Swipe right for previous</span>
                </div>
                <div className="flex items-center">
                  <span>Swipe left for next</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Toast */}
          {showFeedback && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
              <Card className={currentFeedback.includes("Correct") ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50"}>
                <CardContent className="p-3">
                  <p className={`text-sm font-medium ${currentFeedback.includes("Correct") ? "text-green-800" : "text-amber-800"}`}>
                    {currentFeedback}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}