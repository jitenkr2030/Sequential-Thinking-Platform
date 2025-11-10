"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SequentialThinkingEngine } from "@/components/sequential-thinking-engine"
import { domainTemplates } from "@/lib/domain-templates"
import { DomainTemplate, ThoughtData } from "@/types/sequential-thinking"
import { 
  BookOpen, 
  Brain, 
  Target, 
  Lightbulb, 
  ArrowLeft,
  ArrowRight,
  Save,
  Share2,
  Download,
  FileText,
  HelpCircle
} from "lucide-react"

const domainTemplatesList = domainTemplates

interface SelfStudyModeProps {
  onBack?: () => void
}

export function SelfStudyMode({ onBack }: SelfStudyModeProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainTemplate | null>(null)
  const [customProblem, setCustomProblem] = useState("")
  const [selectedSampleProblem, setSelectedSampleProblem] = useState("")
  const [sessionStarted, setSessionStarted] = useState(false)
  const [thoughtHistory, setThoughtHistory] = useState<ThoughtData[]>([])

  const handleDomainSelect = (domain: DomainTemplate) => {
    setSelectedDomain(domain)
    setSelectedSampleProblem("")
    setCustomProblem("")
  }

  const handleStartSession = () => {
    if (!selectedDomain) return
    const problem = selectedSampleProblem || customProblem
    if (!problem.trim()) return
    setSessionStarted(true)
  }

  const handleThoughtComplete = (thought: ThoughtData) => {
    setThoughtHistory(prev => [...prev, thought])
  }

  const handleSessionComplete = (thoughts: ThoughtData[]) => {
    setThoughtHistory(thoughts)
    // Here you could save the session, show results, etc.
  }

  const handleBackToSetup = () => {
    setSessionStarted(false)
    setThoughtHistory([])
  }

  if (sessionStarted && selectedDomain) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBackToSetup}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedDomain.name} - Self-Study</h2>
              <p className="text-gray-600">Sequential Thinking Session</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={selectedDomain.color}>
              {selectedDomain.name}
            </Badge>
          </div>
        </div>

        {/* Sequential Thinking Engine */}
        <SequentialThinkingEngine
          problem={selectedSampleProblem || customProblem}
          domain={selectedDomain.name}
          availableTools={selectedDomain.commonTools}
          onThoughtComplete={handleThoughtComplete}
          onSessionComplete={handleSessionComplete}
        />

        {/* Session Actions */}
        {thoughtHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Session Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Session
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold">Self-Study Mode</h2>
          <p className="text-gray-600">Learn step-by-step reasoning with AI guidance</p>
        </div>
      </div>

      <Tabs defaultValue="domain-select" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="domain-select">Select Domain</TabsTrigger>
          <TabsTrigger value="problem-setup" disabled={!selectedDomain}>
            Problem Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domain-select" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Choose Your Learning Domain
              </CardTitle>
              <CardDescription>
                Select the domain you want to practice reasoning in. Each domain has specific tools and frameworks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domainTemplatesList.map((domain) => (
                  <Card 
                    key={domain.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedDomain?.id === domain.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => handleDomainSelect(domain)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-2">{domain.icon}</div>
                      <CardTitle className="text-lg">{domain.name}</CardTitle>
                      <CardDescription className="text-sm">{domain.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Common Tools:</h4>
                        <div className="flex flex-wrap gap-1">
                          {domain.commonTools.slice(0, 3).map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                        <h4 className="font-medium text-sm mt-2">Reasoning Framework:</h4>
                        <div className="text-xs text-gray-600">
                          {domain.reasoningFramework.join(' → ')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problem-setup" className="space-y-6">
          {selectedDomain && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {selectedDomain.name} - Problem Setup
                  </CardTitle>
                  <CardDescription>
                    Choose a sample problem or create your own to practice sequential thinking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sample Problems */}
                  <div>
                    <Label className="text-base font-medium">Sample Problems</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Choose from pre-designed problems for {selectedDomain.name.toLowerCase()}
                    </p>
                    <div className="space-y-2">
                      {selectedDomain.sampleProblems.map((problem, index) => (
                        <div 
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSampleProblem === problem 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedSampleProblem(problem)
                            setCustomProblem("")
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5 flex items-center justify-center">
                              {selectedSampleProblem === problem && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm">{problem}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Custom Problem */}
                  <div>
                    <Label htmlFor="custom-problem" className="text-base font-medium">
                      Create Your Own Problem
                    </Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Write your own problem statement to practice with
                    </p>
                    <Textarea
                      id="custom-problem"
                      value={customProblem}
                      onChange={(e) => {
                        setCustomProblem(e.target.value)
                        setSelectedSampleProblem("")
                      }}
                      placeholder="Enter your problem statement here..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Start Session Button */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {(selectedSampleProblem || customProblem) ? 'Ready to start!' : 'Select or create a problem to begin'}
                      </span>
                    </div>
                    <Button 
                      onClick={handleStartSession}
                      disabled={!selectedSampleProblem && !customProblem.trim()}
                      size="lg"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Start Sequential Thinking
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Domain Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    {selectedDomain.name} Reasoning Framework
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Sequential Thinking Process:</h4>
                      <div className="flex items-center flex-wrap gap-2">
                        {selectedDomain.reasoningFramework.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <Badge variant="outline" className="px-3 py-1">
                              {step}
                            </Badge>
                            {index < selectedDomain.reasoningFramework.length - 1 && (
                              <ArrowRight className="w-4 h-4 mx-1 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Available Tools:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDomain.commonTools.map((tool, index) => (
                          <Badge key={index} variant="secondary">
                            {tool.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}