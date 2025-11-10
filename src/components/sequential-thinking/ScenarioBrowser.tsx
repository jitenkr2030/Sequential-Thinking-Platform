"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { detailedScenarios, domainScenarios } from "@/data/domainScenarios"
import { ArrowLeft, Clock, Target, TrendingUp, BookOpen } from "lucide-react"

interface ScenarioBrowserProps {
  onScenarioSelect: (scenario: any) => void
  onBack: () => void
}

export function ScenarioBrowser({ onScenarioSelect, onBack }: ScenarioBrowserProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-yellow-100 text-yellow-800"
      case "Advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "🌱"
      case "Intermediate": return "📈"
      case "Advanced": return "🚀"
      default: return "📚"
    }
  }

  const filteredScenarios = selectedDomain 
    ? detailedScenarios[selectedDomain as keyof typeof detailedScenarios]?.filter(
        (scenario: any) => !selectedDifficulty || scenario.difficulty === selectedDifficulty
      ) || []
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Scenario Library</h1>
                  <p className="text-sm text-gray-600">Choose from hundreds of professional reasoning scenarios</p>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              <Target className="w-3 h-3 mr-1" />
              {Object.values(detailedScenarios).flat().length} Scenarios
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedDomain ? (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comprehensive Scenario Library
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Explore our extensive collection of professional reasoning scenarios across multiple domains. 
                Each scenario is carefully designed to develop critical thinking and problem-solving skills.
              </p>
            </div>

            {/* Domain Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domainScenarios.map((domain) => {
                const scenarios = detailedScenarios[domain.id as keyof typeof detailedScenarios] || []
                return (
                  <Card 
                    key={domain.id} 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                    onClick={() => setSelectedDomain(domain.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="text-4xl mb-2">{domain.icon}</div>
                      <CardTitle className="text-lg">{domain.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {domain.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Scenarios:</span>
                          <Badge variant="secondary">{scenarios.length}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <div className="flex space-x-1">
                            {scenarios.some((s: any) => s.difficulty === "Beginner") && (
                              <Badge className="text-xs bg-green-100 text-green-800">B</Badge>
                            )}
                            {scenarios.some((s: any) => s.difficulty === "Intermediate") && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800">I</Badge>
                            )}
                            {scenarios.some((s: any) => s.difficulty === "Advanced") && (
                              <Badge className="text-xs bg-red-100 text-red-800">A</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Time:</span>
                          <span className="text-gray-700">
                            {Math.round(scenarios.reduce((sum, s: any) => sum + s.timeLimit, 0) / scenarios.length)}min
                          </span>
                        </div>
                        <Button className="w-full mt-4">
                          Browse Scenarios
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Stats */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(detailedScenarios).flat().length}
                    </div>
                    <div className="text-sm text-gray-600">Total Scenarios</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(detailedScenarios).flat().filter((s: any) => s.difficulty === "Beginner").length}
                    </div>
                    <div className="text-sm text-gray-600">Beginner</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {Object.values(detailedScenarios).flat().filter((s: any) => s.difficulty === "Intermediate").length}
                    </div>
                    <div className="text-sm text-gray-600">Intermediate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(detailedScenarios).flat().filter((s: any) => s.difficulty === "Advanced").length}
                    </div>
                    <div className="text-sm text-gray-600">Advanced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Domain-Specific Scenarios */
          <div className="space-y-6">
            {/* Domain Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {domainScenarios.find(d => d.id === selectedDomain)?.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {domainScenarios.find(d => d.id === selectedDomain)?.name} Scenarios
                      </CardTitle>
                      <CardDescription>
                        {domainScenarios.find(d => d.id === selectedDomain)?.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedDomain("")}
                  >
                    All Domains
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Difficulty:</span>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredScenarios.length} of {detailedScenarios[selectedDomain as keyof typeof detailedScenarios]?.length} scenarios
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenarios Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario: any) => (
                <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDifficultyColor(scenario.difficulty)}`}>
                        {getDifficultyIcon(scenario.difficulty)} {scenario.difficulty}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {scenario.timeLimit}min
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {scenario.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {scenario.problem}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Expected Reasoning:
                      </p>
                      <div className="space-y-1">
                        {scenario.expectedReasoning.slice(0, 3).map((step: string, index: number) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
                            {step}
                          </div>
                        ))}
                        {scenario.expectedReasoning.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{scenario.expectedReasoning.length - 3} more steps...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Available Tools:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {scenario.tools.slice(0, 3).map((tool: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {scenario.tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{scenario.tools.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => onScenarioSelect({
                        ...scenario,
                        domain: selectedDomain,
                        domainName: domainScenarios.find(d => d.id === selectedDomain)?.name
                      })}
                    >
                      Start Scenario
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredScenarios.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No scenarios found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your difficulty filter or check back later for new scenarios.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}