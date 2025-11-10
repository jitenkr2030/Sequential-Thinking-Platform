"use client"

import { useState, useCallback } from "react"
import { ThoughtData, ToolRecommendation, StepRecommendation } from "@/types/sequential-thinking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  Target, 
  CheckCircle, 
  Clock, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  GitBranch,
  HelpCircle
} from "lucide-react"

interface SequentialThinkingEngineProps {
  problem: string
  domain: string
  availableTools: string[]
  onThoughtComplete?: (thought: ThoughtData) => void
  onSessionComplete?: (thoughts: ThoughtData[]) => void
}

export function SequentialThinkingEngine({
  problem,
  domain,
  availableTools,
  onThoughtComplete,
  onSessionComplete
}: SequentialThinkingEngineProps) {
  const [currentThought, setCurrentThought] = useState<ThoughtData | null>(null)
  const [thoughtHistory, setThoughtHistory] = useState<ThoughtData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [estimatedTotalThoughts, setEstimatedTotalThoughts] = useState(5)

  // Simulate MCP sequential thinking tools integration
  const processThought = useCallback(async (thoughtData: ThoughtData): Promise<ThoughtData> => {
    setIsProcessing(true)
    
    try {
      // In a real implementation, this would call the mcp-sequentialthinking-tools API
      // For now, we'll simulate the response with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate tool recommendations based on the domain and current thought
      const toolRecommendations = generateToolRecommendations(thoughtData, domain)
      
      const processedThought: ThoughtData = {
        ...thoughtData,
        current_step: toolRecommendations,
        previous_steps: thoughtHistory.map(t => t.current_step).filter(Boolean) as StepRecommendation[]
      }
      
      return processedThought
    } catch (error) {
      console.error('Error processing thought:', error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [thoughtHistory, domain])

  const generateToolRecommendations = (thoughtData: ThoughtData, domain: string): StepRecommendation => {
    // Simulate intelligent tool recommendations based on domain and thought content
    const domainTools: Record<string, string[]> = {
      'Finance & Accounting': ['financial_calculator', 'accounting_standards', 'audit_procedures'],
      'Law': ['legal_database', 'case_law_search', 'statute_analyzer'],
      'Medicine': ['medical_database', 'diagnostic_tools', 'treatment_guidelines'],
      'Engineering': ['engineering_calculator', 'design_standards', 'simulation_tools'],
      'Data Science': ['data_analyzer', 'ml_model_selector', 'visualization_tools'],
      'Business': ['swot_analyzer', 'financial_modeler', 'market_research']
    }

    const tools = domainTools[domain] || ['general_analyzer']
    
    return {
      step_description: `Analyze: ${thoughtData.thought}`,
      recommended_tools: tools.map((tool, index) => ({
        tool_name: tool,
        confidence: 0.8 + (Math.random() * 0.2),
        rationale: `This ${tool.replace('_', ' ')} is well-suited for ${domain.toLowerCase()} analysis`,
        priority: index + 1,
        alternatives: tools.filter(t => t !== tool).slice(0, 2)
      })),
      expected_outcome: "Clear understanding and structured analysis of the current step",
      next_step_conditions: [
        "Verify analysis accuracy",
        "Consider alternative approaches",
        "Prepare for next logical step"
      ]
    }
  }

  const addThought = async () => {
    if (!userInput.trim()) return

    const thoughtNumber = thoughtHistory.length + 1
    const newThought: ThoughtData = {
      available_mcp_tools: availableTools,
      thought: userInput,
      thought_number: thoughtNumber,
      total_thoughts: estimatedTotalThoughts,
      next_thought_needed: thoughtNumber < estimatedTotalThoughts
    }

    try {
      const processedThought = await processThought(newThought)
      setCurrentThought(processedThought)
      setThoughtHistory(prev => [...prev, processedThought])
      setUserInput("")
      
      onThoughtComplete?.(processedThought)

      // Check if session is complete
      if (thoughtNumber >= estimatedTotalThoughts && !processedThought.next_thought_needed) {
        onSessionComplete?.([...thoughtHistory, processedThought])
      }
    } catch (error) {
      console.error('Error adding thought:', error)
    }
  }

  const reviseThought = async (thoughtIndex: number, newThoughtText: string) => {
    const originalThought = thoughtHistory[thoughtIndex]
    const revisedThought: ThoughtData = {
      ...originalThought,
      thought: newThoughtText,
      is_revision: true,
      revises_thought: thoughtIndex + 1
    }

    try {
      const processedThought = await processThought(revisedThought)
      const newHistory = [...thoughtHistory]
      newHistory[thoughtIndex] = processedThought
      setThoughtHistory(newHistory)
      setCurrentThought(processedThought)
    } catch (error) {
      console.error('Error revising thought:', error)
    }
  }

  const progress = thoughtHistory.length > 0 ? (thoughtHistory.length / estimatedTotalThoughts) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Problem Statement
          </CardTitle>
          <CardDescription>{domain} Domain</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{problem}</p>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sequential Thinking Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Thought {thoughtHistory.length} of {estimatedTotalThoughts}
              </span>
              <Badge variant={progress >= 100 ? "default" : "secondary"}>
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Thought Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Current Thought
          </CardTitle>
          <CardDescription>
            Express your current reasoning step. What are you analyzing or considering?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your current thought or reasoning step..."
              className="min-h-[100px]"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="total-thoughts">Estimated Total Thoughts:</Label>
                <Input
                  id="total-thoughts"
                  type="number"
                  min="1"
                  max="20"
                  value={estimatedTotalThoughts}
                  onChange={(e) => setEstimatedTotalThoughts(parseInt(e.target.value) || 5)}
                  className="w-20"
                />
              </div>
              <Button 
                onClick={addThought} 
                disabled={!userInput.trim() || isProcessing}
                className="ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Add Thought
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Thought Analysis */}
      {currentThought && currentThought.current_step && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              Current Step Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Step Description</h4>
                <p className="text-blue-700">{currentThought.current_step.step_description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Recommended Tools</h4>
                <div className="space-y-2">
                  {currentThought.current_step.recommended_tools.map((tool, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{tool.tool_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Confidence: {Math.round(tool.confidence * 100)}%
                          </Badge>
                          <Badge variant="secondary">Priority: {tool.priority}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tool.rationale}</p>
                      {tool.alternatives && tool.alternatives.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Alternatives: {tool.alternatives.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">Expected Outcome</h4>
                <p className="text-blue-700">{currentThought.current_step.expected_outcome}</p>
              </div>

              {currentThought.current_step.next_step_conditions && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Next Step Conditions</h4>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    {currentThought.current_step.next_step_conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thought History */}
      {thoughtHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Thought History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thoughtHistory.map((thought, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {thought.is_revision ? (
                        <GitBranch className="h-4 w-4 text-amber-600" />
                      ) : (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{index + 1}</span>
                        </div>
                      )}
                      <span className="font-medium">
                        Thought {thought.thought_number}
                        {thought.is_revision && (
                          <Badge variant="outline" className="ml-2">Revision</Badge>
                        )}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {thought.thought_number}/{thought.total_thoughts}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{thought.thought}</p>
                  {thought.current_step && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Step:</span> {thought.current_step.step_description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Complete */}
      {progress >= 100 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Sequential thinking session completed! You've successfully worked through {thoughtHistory.length} reasoning steps.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}