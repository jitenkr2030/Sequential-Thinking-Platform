"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { domainTemplates } from "@/lib/domain-templates"
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Share2,
  Download,
  BookOpen,
  Target,
  Brain,
  Lightbulb
} from "lucide-react"

interface ReasoningStep {
  id: string
  title: string
  description: string
  expectedOutcome: string
  tools: string[]
  timeEstimate: number
}

interface ReasoningMap {
  id: string
  title: string
  domain: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: ReasoningStep[]
  createdAt: Date
  lastModified: Date
}

interface TeachingModeProps {
  onBack?: () => void
}

export function TeachingMode({ onBack }: TeachingModeProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [reasoningMaps, setReasoningMaps] = useState<ReasoningMap[]>([])
  const [currentMap, setCurrentMap] = useState<ReasoningMap | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newStep, setNewStep] = useState<Partial<ReasoningStep>>({})

  const sampleMaps: ReasoningMap[] = [
    {
      id: "1",
      title: "Financial Ratio Analysis",
      domain: "Finance & Accounting",
      description: "Complete guide to analyzing financial statements using ratio analysis",
      difficulty: "intermediate",
      steps: [
        {
          id: "s1",
          title: "Gather Financial Data",
          description: "Collect balance sheet, income statement, and cash flow statement data",
          expectedOutcome: "Organized financial data ready for analysis",
          tools: ["financial_calculator", "data_organizer"],
          timeEstimate: 5
        },
        {
          id: "s2",
          title: "Calculate Liquidity Ratios",
          description: "Compute current ratio, quick ratio, and cash ratio",
          expectedOutcome: "Understanding of short-term financial health",
          tools: ["ratio_analyzer", "financial_calculator"],
          timeEstimate: 10
        },
        {
          id: "s3",
          title: "Analyze Profitability",
          description: "Calculate and interpret profit margins, ROE, ROA",
          expectedOutcome: "Assessment of company's ability to generate profits",
          tools: ["profitability_analyzer", "trend_analyzer"],
          timeEstimate: 15
        }
      ],
      createdAt: new Date(),
      lastModified: new Date()
    },
    {
      id: "2",
      title: "Legal Case Analysis Framework",
      domain: "Law",
      description: "Systematic approach to analyzing legal cases and forming arguments",
      difficulty: "advanced",
      steps: [
        {
          id: "s1",
          title: "Identify Legal Issues",
          description: "Determine the key legal questions and disputes",
          expectedOutcome: "Clear statement of legal issues to be resolved",
          tools: ["issue_identifier", "case_analyzer"],
          timeEstimate: 10
        },
        {
          id: "s2",
          title: "Research Applicable Law",
          description: "Find relevant statutes, regulations, and precedents",
          expectedOutcome: "Comprehensive legal research summary",
          tools: ["legal_database", "case_law_search"],
          timeEstimate: 20
        }
      ],
      createdAt: new Date(),
      lastModified: new Date()
    }
  ]

  const handleCreateMap = () => {
    const newMap: ReasoningMap = {
      id: Date.now().toString(),
      title: "New Reasoning Map",
      domain: selectedDomain,
      description: "Enter description here",
      difficulty: "intermediate",
      steps: [],
      createdAt: new Date(),
      lastModified: new Date()
    }
    setCurrentMap(newMap)
    setIsEditing(true)
  }

  const handleAddStep = () => {
    if (!currentMap || !newStep.title) return

    const step: ReasoningStep = {
      id: Date.now().toString(),
      title: newStep.title || "",
      description: newStep.description || "",
      expectedOutcome: newStep.expectedOutcome || "",
      tools: newStep.tools || [],
      timeEstimate: newStep.timeEstimate || 5
    }

    const updatedMap = {
      ...currentMap,
      steps: [...currentMap.steps, step],
      lastModified: new Date()
    }

    setCurrentMap(updatedMap)
    setNewStep({})
  }

  const handleSaveMap = () => {
    if (!currentMap) return
    setReasoningMaps(prev => [...prev, currentMap])
    setIsEditing(false)
    setCurrentMap(null)
  }

  const handleDeleteStep = (stepId: string) => {
    if (!currentMap) return
    const updatedMap = {
      ...currentMap,
      steps: currentMap.steps.filter(step => step.id !== stepId),
      lastModified: new Date()
    }
    setCurrentMap(updatedMap)
  }

  if (currentMap && isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {
              setIsEditing(false)
              setCurrentMap(null)
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maps
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Edit Reasoning Map</h2>
              <p className="text-gray-600">{currentMap.title}</p>
            </div>
          </div>
          <Button onClick={handleSaveMap}>
            <Save className="w-4 h-4 mr-2" />
            Save Map
          </Button>
        </div>

        {/* Map Editor */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Map Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="map-title">Title</Label>
                  <Input
                    id="map-title"
                    value={currentMap.title}
                    onChange={(e) => setCurrentMap(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="map-domain">Domain</Label>
                  <Select 
                    value={currentMap.domain} 
                    onValueChange={(value) => setCurrentMap(prev => prev ? { ...prev, domain: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {domainTemplates.map(domain => (
                        <SelectItem key={domain.id} value={domain.name}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="map-description">Description</Label>
                  <Textarea
                    id="map-description"
                    value={currentMap.description}
                    onChange={(e) => setCurrentMap(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="map-difficulty">Difficulty</Label>
                  <Select 
                    value={currentMap.difficulty} 
                    onValueChange={(value: any) => setCurrentMap(prev => prev ? { ...prev, difficulty: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Steps Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reasoning Steps</CardTitle>
                <CardDescription>
                  Define the step-by-step reasoning process for this learning path
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Steps */}
                {currentMap.steps.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Steps</h4>
                    {currentMap.steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <h5 className="font-medium">{step.title}</h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="ml-10 space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Expected:</span> {step.expectedOutcome}
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="font-medium">Time:</span> {step.timeEstimate} min
                            </div>
                            <div>
                              <span className="font-medium">Tools:</span> {step.tools.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Step */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Add New Step</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="step-title">Step Title</Label>
                        <Input
                          id="step-title"
                          value={newStep.title || ""}
                          onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter step title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="step-time">Time Estimate (minutes)</Label>
                        <Input
                          id="step-time"
                          type="number"
                          value={newStep.timeEstimate || ""}
                          onChange={(e) => setNewStep(prev => ({ ...prev, timeEstimate: parseInt(e.target.value) }))}
                          placeholder="5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="step-description">Description</Label>
                      <Textarea
                        id="step-description"
                        value={newStep.description || ""}
                        onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what the learner should do in this step"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="step-outcome">Expected Outcome</Label>
                      <Textarea
                        id="step-outcome"
                        value={newStep.expectedOutcome || ""}
                        onChange={(e) => setNewStep(prev => ({ ...prev, expectedOutcome: e.target.value }))}
                        placeholder="What should the learner achieve after this step?"
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleAddStep} disabled={!newStep.title}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (currentMap && !isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentMap(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maps
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{currentMap.title}</h2>
              <p className="text-gray-600">{currentMap.domain} • {currentMap.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Map Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Map Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentMap.description}</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentMap.steps.length}</div>
                <div className="text-sm text-gray-600">Reasoning Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentMap.steps.reduce((total, step) => total + step.timeEstimate, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Minutes</div>
              </div>
              <div className="text-center">
                <Badge variant={currentMap.difficulty === 'advanced' ? 'destructive' : currentMap.difficulty === 'intermediate' ? 'default' : 'secondary'}>
                  {currentMap.difficulty}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Difficulty</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reasoning Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Reasoning Steps
            </CardTitle>
            <CardDescription>
              Step-by-step learning path for developing {currentMap.domain.toLowerCase()} reasoning skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentMap.steps.map((step, index) => (
                <div key={step.id} className="border-l-4 border-blue-200 pl-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{step.timeEstimate} min</Badge>
                          {step.tools.length > 0 && (
                            <Badge variant="secondary">{step.tools.length} tools</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{step.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-1">Expected Outcome:</h4>
                        <p className="text-blue-700">{step.expectedOutcome}</p>
                      </div>
                      {step.tools.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-700 mb-2">Recommended Tools:</h4>
                          <div className="flex flex-wrap gap-2">
                            {step.tools.map((tool, toolIndex) => (
                              <Badge key={toolIndex} variant="outline" className="text-xs">
                                {tool.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              How to Use This Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Instructors:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Use this map as a template for creating structured learning experiences</li>
                  <li>Customize steps based on your students' needs and skill levels</li>
                  <li>Monitor student progress through each reasoning step</li>
                  <li>Provide targeted feedback at each stage of the reasoning process</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Students:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Follow each step in sequence to develop comprehensive reasoning skills</li>
                  <li>Use the recommended tools to enhance your analysis</li>
                  <li>Take time to understand each concept before moving to the next step</li>
                  <li>Practice applying the reasoning framework to different problems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <h2 className="text-2xl font-bold">Teaching & Coaching Mode</h2>
          <p className="text-gray-600">Design and monitor reasoning learning paths</p>
        </div>
      </div>

      <Tabs defaultValue="my-maps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-maps">My Reasoning Maps</TabsTrigger>
          <TabsTrigger value="create">Create New Map</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Reasoning Maps
              </CardTitle>
              <CardDescription>
                Manage and monitor your custom reasoning learning paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleMaps.map((map) => (
                  <Card 
                    key={map.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => setCurrentMap(map)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{map.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {map.steps.length} steps
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{map.domain}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{map.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={map.difficulty === 'advanced' ? 'destructive' : map.difficulty === 'intermediate' ? 'default' : 'secondary'}>
                          {map.difficulty}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Reasoning Map
              </CardTitle>
              <CardDescription>
                Design a custom learning path for teaching sequential reasoning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Select Domain</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose the professional domain for this reasoning map
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domainTemplates.map((domain) => (
                    <Card 
                      key={domain.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedDomain === domain.name ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => setSelectedDomain(domain.name)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className="text-4xl mb-2">{domain.icon}</div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <Badge variant="outline" className={domain.color}>
                            {domain.reasoningFramework.length} steps
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-500">
                  {selectedDomain ? 'Ready to create your reasoning map!' : 'Select a domain to continue'}
                </div>
                <Button 
                  onClick={handleCreateMap}
                  disabled={!selectedDomain}
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Reasoning Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Reasoning Map Templates
              </CardTitle>
              <CardDescription>
                Pre-designed templates for common teaching scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Beginner Reasoning</CardTitle>
                    <CardDescription>
                      Template for introducing basic sequential thinking concepts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• 3-5 simple reasoning steps</div>
                      <div>• Clear, guided instructions</div>
                      <div>• Basic tool recommendations</div>
                      <div>• 15-30 minute duration</div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Analysis</CardTitle>
                    <CardDescription>
                      Template for complex, multi-step reasoning challenges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• 7-10 comprehensive steps</div>
                      <div>• Complex problem scenarios</div>
                      <div>• Advanced tool integration</div>
                      <div>• 60-90 minute duration</div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}