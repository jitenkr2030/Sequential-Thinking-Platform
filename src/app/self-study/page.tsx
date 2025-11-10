"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SequentialThinkingEngine } from "@/components/sequential-thinking/SequentialThinkingEngine"
import { ScenarioBrowser } from "@/components/sequential-thinking/ScenarioBrowser"
import { DomainScenario } from "@/types/sequential-thinking"
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  Lightbulb,
  CheckCircle,
  Clock
} from "lucide-react"

const domainScenarios: DomainScenario[] = [
  {
    id: "finance",
    name: "Finance & Accounting",
    description: "Practice financial analysis, accounting principles, and investment reasoning",
    icon: "📊",
    color: "bg-emerald-100 text-emerald-800",
    sampleProblem: "A company has current assets of $500,000 and current liabilities of $200,000. Calculate the current ratio and analyze what this indicates about the company's short-term financial health.",
    tools: ["financial_calculator", "ratio_analyzer", "accounting_standards"],
    reasoningSteps: ["Identify relevant data", "Apply formula", "Calculate ratio", "Interpret results", "Consider implications"]
  },
  {
    id: "law",
    name: "Law",
    description: "Practice legal reasoning, case analysis, and statutory interpretation",
    icon: "⚖️",
    color: "bg-blue-100 text-blue-800",
    sampleProblem: "Analyze whether a contract formed through email exchange constitutes a valid agreement under common law principles. Consider the elements of offer, acceptance, and consideration.",
    tools: ["case_law_search", "statute_lookup", "legal_reasoning_framework"],
    reasoningSteps: ["Identify legal issue", "Find relevant law", "Apply law to facts", "Consider counterarguments", "Draw conclusion"]
  },
  {
    id: "medicine",
    name: "Medicine",
    description: "Practice clinical reasoning, diagnosis, and treatment planning",
    icon: "🏥",
    color: "bg-red-100 text-red-800",
    sampleProblem: "A 45-year-old patient presents with chest pain, shortness of breath, and fatigue. Develop a differential diagnosis and outline your reasoning process for determining the most likely cause.",
    tools: ["medical_database", "symptom_analyzer", "treatment_guidelines"],
    reasoningSteps: ["Gather patient information", "Identify key symptoms", "Generate differential diagnosis", "Order diagnostic tests", "Formulate treatment plan"]
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Practice technical problem-solving, design analysis, and calculations",
    icon: "⚙️",
    color: "bg-gray-100 text-gray-800",
    sampleProblem: "Design a beam to support a concentrated load of 10 kN at its center. The beam is 3 meters long and made of steel with a yield strength of 250 MPa. Determine the minimum required section modulus.",
    tools: ["engineering_calculator", "material_properties", "design_codes"],
    reasoningSteps: ["Identify loading conditions", "Apply relevant formulas", "Calculate requirements", "Check safety factors", "Verify with codes"]
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Practice data analysis, model selection, and statistical reasoning",
    icon: "📈",
    color: "bg-indigo-100 text-indigo-800",
    sampleProblem: "You have a dataset with customer churn information. Develop a step-by-step reasoning process for building a predictive model, including data preprocessing, feature selection, and model evaluation.",
    tools: ["statistical_tools", "ml_algorithms", "data_visualization"],
    reasoningSteps: ["Explore dataset", "Clean and preprocess", "Select features", "Choose model", "Evaluate performance"]
  },
  {
    id: "business",
    name: "Business",
    description: "Practice strategic thinking, case analysis, and decision-making",
    icon: "💼",
    color: "bg-amber-100 text-amber-800",
    sampleProblem: "A retail company is experiencing declining sales. Analyze the situation using SWOT analysis and develop a strategic plan to address the challenges while leveraging opportunities.",
    tools: ["business_frameworks", "market_analysis", "financial_modeling"],
    reasoningSteps: ["Analyze current situation", "Identify key factors", "Apply framework", "Develop strategy", "Create action plan"]
  }
]

export default function SelfStudyPage() {
  const [selectedDomain, setSelectedDomain] = useState<DomainScenario | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<any>(null)
  const [showScenarioBrowser, setShowScenarioBrowser] = useState(false)
  const [customProblem, setCustomProblem] = useState("")

  const handleSessionComplete = (thoughts: any[]) => {
    console.log("Session completed with thoughts:", thoughts)
  }

  const handleScenarioSelect = (scenario: any) => {
    setSelectedScenario(scenario)
    setSelectedDomain({
      id: scenario.domain,
      name: scenario.domainName,
      description: "",
      icon: domainScenarios.find(d => d.id === scenario.domain)?.icon || "📚",
      color: "",
      sampleProblem: scenario.problem,
      tools: scenario.tools,
      reasoningSteps: scenario.expectedReasoning
    })
    setShowScenarioBrowser(false)
  }

  const handleBackToMain = () => {
    if (selectedScenario) {
      setSelectedScenario(null)
      setSelectedDomain(null)
    } else if (showScenarioBrowser) {
      setShowScenarioBrowser(false)
    } else {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleBackToMain}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Self-Study Mode</h1>
                  <p className="text-sm text-gray-600">Learn step-by-step reasoning with AI guidance</p>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              <Brain className="w-3 h-3 mr-1" />
              Sequential Thinking
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showScenarioBrowser ? (
          <ScenarioBrowser 
            onScenarioSelect={handleScenarioSelect}
            onBack={() => setShowScenarioBrowser(false)}
          />
        ) : !selectedDomain ? (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Learning Path
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Select a domain to start your sequential thinking journey or browse our comprehensive scenario library.
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowScenarioBrowser(true)}
                className="mb-8"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Scenarios
              </Button>
            </div>

            {/* Domain Selection */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domainScenarios.map((domain) => (
                <Card 
                  key={domain.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                  onClick={() => setSelectedDomain(domain)}
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
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Sample Problem:
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {domain.sampleProblem}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Reasoning Steps:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {domain.reasoningSteps.map((step, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {index + 1}. {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4">
                        Start Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Problem */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Have Your Own Problem?</span>
                </CardTitle>
                <CardDescription>
                  Enter your own problem or case study to practice sequential thinking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="Enter your problem, case study, or question here..."
                  className="w-full min-h-24 p-3 border rounded-md resize-none"
                />
                <Button 
                  className="w-full"
                  disabled={!customProblem.trim()}
                  onClick={() => {
                    setSelectedDomain({
                      id: "custom",
                      name: "Custom Problem",
                      description: "Your personalized reasoning challenge",
                      icon: "🎯",
                      color: "bg-purple-100 text-purple-800",
                      sampleProblem: customProblem,
                      tools: ["general_tools"],
                      reasoningSteps: ["Analyze", "Reason", "Conclude"]
                    })
                  }}
                >
                  Start Custom Session
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Sequential Thinking Interface */
          <div className="space-y-6">
            {/* Domain Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{selectedDomain.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{selectedDomain.name}</CardTitle>
                      <CardDescription>{selectedDomain.description}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedDomain(null)}
                  >
                    Change Domain
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Sequential Thinking Engine */}
            <SequentialThinkingEngine
              mode="self-study"
              domain={selectedDomain.name}
              problem={selectedDomain.sampleProblem}
              onSessionComplete={handleSessionComplete}
            />

            {/* Learning Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Learning Tips for {selectedDomain.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Best Practices:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Take time to analyze each step thoroughly
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Consider multiple perspectives before concluding
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        Use the recommended tools to enhance your analysis
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Success Indicators:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-blue-500" />
                        Clear, logical progression of thoughts
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-blue-500" />
                        Well-supported conclusions with evidence
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-blue-500" />
                        Consideration of alternative approaches
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}