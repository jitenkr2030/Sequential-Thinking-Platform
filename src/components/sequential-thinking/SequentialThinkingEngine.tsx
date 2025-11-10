"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ThoughtData, 
  SequentialThinkingResponse, 
  ToolRecommendation, 
  StepRecommendation 
} from '@/types/sequential-thinking'
import { 
  Brain, 
  ChevronRight, 
  Lightbulb, 
  Target, 
  CheckCircle, 
  Clock,
  RefreshCw,
  HelpCircle
} from 'lucide-react'

interface SequentialThinkingEngineProps {
  mode: 'self-study' | 'exam-simulation' | 'teaching'
  domain: string
  problem?: string
  onSessionComplete?: (thoughts: ThoughtData[]) => void
}

export function SequentialThinkingEngine({ 
  mode, 
  domain, 
  problem: initialProblem, 
  onSessionComplete 
}: SequentialThinkingEngineProps) {
  const [currentProblem, setCurrentProblem] = useState(initialProblem || '')
  const [thoughts, setThoughts] = useState<ThoughtData[]>([])
  const [currentThought, setCurrentThought] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalThoughts, setTotalThoughts] = useState(5)
  const [sessionStarted, setSessionStarted] = useState(false)

  const processThought = useCallback(async (thoughtData: ThoughtData) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/sequential-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(thoughtData)
      })
      
      if (!response.ok) throw new Error('Failed to process thought')
      
      const result: SequentialThinkingResponse = await response.json()
      return result
    } catch (error) {
      console.error('Error processing thought:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const addThought = useCallback(async () => {
    if (!currentThought.trim()) return

    const thoughtData: ThoughtData = {
      available_mcp_tools: ['search_docs', 'calculator', 'formula_lookup'],
      thought: currentThought,
      thought_number: thoughts.length + 1,
      total_thoughts,
      next_thought_needed: thoughts.length + 1 < totalThoughts
    }

    try {
      const result = await processThought(thoughtData)
      
      const newThought: ThoughtData = {
        ...thoughtData,
        current_step: result.current_step,
        previous_steps: result.previous_steps,
        remaining_steps: result.remaining_steps
      }

      setThoughts(prev => [...prev, newThought])
      setCurrentThought('')
      
      if (!result.next_thought_needed) {
        onSessionComplete?.([...thoughts, newThought])
      }
    } catch (error) {
      console.error('Error adding thought:', error)
    }
  }, [currentThought, thoughts, totalThoughts, processThought, onSessionComplete])

  const startSession = () => {
    if (!currentProblem.trim()) return
    setSessionStarted(true)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const renderToolRecommendation = (tool: ToolRecommendation) => (
    <div key={tool.tool_name} className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{tool.tool_name}</span>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getConfidenceColor(tool.confidence)}`} />
          <span className="text-xs text-gray-500">{Math.round(tool.confidence * 100)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-600">{tool.rationale}</p>
      {tool.alternatives && (
        <div className="text-xs">
          <span className="text-gray-500">Alternatives: </span>
          <span className="text-blue-600">{tool.alternatives.join(', ')}</span>
        </div>
      )}
    </div>
  )

  const renderStep = (step: StepRecommendation, index: number) => (
    <Card key={index} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-sm">Step {index + 1}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">What to do:</p>
          <p className="text-sm text-gray-700">{step.step_description}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Recommended Tools:</p>
          <div className="space-y-2">
            {step.recommended_tools.map(renderToolRecommendation)}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1">Expected Outcome:</p>
          <p className="text-sm text-gray-700">{step.expected_outcome}</p>
        </div>
        
        {step.next_step_conditions && (
          <div>
            <p className="text-sm font-medium mb-1">Next Step Conditions:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {step.next_step_conditions.map((condition, i) => (
                <li key={i} className="flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Problem Input */}
      {!sessionStarted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Start Your Reasoning Session</span>
            </CardTitle>
            <CardDescription>
              Enter a problem or case study to begin your sequential thinking process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Problem/Question</label>
              <Textarea
                value={currentProblem}
                onChange={(e) => setCurrentProblem(e.target.value)}
                placeholder="Enter your problem, case study, or question here..."
                className="min-h-24"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Estimated Thinking Steps (default: 5)
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={totalThoughts}
                onChange={(e) => setTotalThoughts(parseInt(e.target.value) || 5)}
                className="w-32"
              />
            </div>
            
            <Button 
              onClick={startSession}
              disabled={!currentProblem.trim()}
              className="w-full"
            >
              Start Reasoning Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reasoning Interface */}
      {sessionStarted && (
        <>
          {/* Progress Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{domain} Problem</h3>
                  <p className="text-sm text-gray-600">{currentProblem}</p>
                </div>
                <Badge variant="outline">
                  {thoughts.length}/{totalThoughts} thoughts
                </Badge>
              </div>
              <Progress value={(thoughts.length / totalThoughts) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Current Thought Input */}
          {thoughts.length < totalThoughts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Thought {thoughts.length + 1}</span>
                </CardTitle>
                <CardDescription>
                  What is your current thinking step? Be reflective and analytical.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentThought}
                  onChange={(e) => setCurrentThought(e.target.value)}
                  placeholder="Enter your current thought process..."
                  className="min-h-20"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={addThought}
                  disabled={!currentThought.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Thought'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Previous Thoughts */}
          <div className="space-y-4">
            {thoughts.map((thought, index) => (
              <div key={index}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span>Thought {thought.thought_number}</span>
                        {thought.is_revision && (
                          <Badge variant="secondary">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Revision
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Step {thought.thought_number}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Your Thinking:</p>
                      <p className="text-gray-700">{thought.thought}</p>
                    </div>
                    
                    {thought.current_step && renderStep(thought.current_step, index)}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Session Complete */}
          {thoughts.length >= totalThoughts && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reasoning session complete!</strong> You've completed all {totalThoughts} thinking steps. 
                Review your thought process above to see the sequential reasoning path.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}