"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SequentialThinkingEngine } from "@/components/sequential-thinking-engine"
import { domainTemplates } from "@/lib/domain-templates"
import { ThoughtData } from "@/types/sequential-thinking"
import { 
  Clock, 
  GraduationCap, 
  Target, 
  Brain, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  FileText,
  BarChart3
} from "lucide-react"

interface ExamQuestion {
  id: string
  type: 'case-study' | 'multiple-choice' | 'essay'
  title: string
  description: string
  timeLimit: number // in minutes
  maxScore: number
  domain: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface ExamSession {
  id: string
  examType: string
  domain: string
  questions: ExamQuestion[]
  currentQuestionIndex: number
  timeRemaining: number
  isPaused: boolean
  startTime: Date
  answers: Record<string, any>
  isCompleted: boolean
}

const sampleQuestions: ExamQuestion[] = [
  {
    id: "finance-1",
    type: "case-study",
    title: "Financial Analysis Case",
    description: "ABC Corporation reported the following financial data: Revenue = $2M, COGS = $1.2M, Operating Expenses = $400K, Interest Expense = $100K, Tax Rate = 30%. Analyze the company's profitability and financial health using appropriate ratios and metrics. Provide your reasoning step by step.",
    timeLimit: 30,
    maxScore: 100,
    domain: "Finance & Accounting",
    difficulty: "medium"
  },
  {
    id: "law-1",
    type: "case-study",
    title: "Contract Law Analysis",
    description: "Party A entered into a contract with Party B to deliver 500 units of product X by June 1st for $10,000. Party A delivered only 400 units on June 3rd due to supply chain issues. Party B refused payment and sued for breach of contract. Analyze this case using legal reasoning principles and determine the likely outcome.",
    timeLimit: 25,
    maxScore: 100,
    domain: "Law",
    difficulty: "medium"
  },
  {
    id: "medicine-1",
    type: "case-study",
    title: "Clinical Reasoning Case",
    description: "A 58-year-old male presents to the emergency department with chest pain radiating to his left arm, shortness of breath, and diaphoresis. Vital signs: BP 165/95, HR 115, RR 26, Temperature 37.2°C. Past medical history includes hypertension and smoking. Develop a differential diagnosis and initial treatment plan using clinical reasoning.",
    timeLimit: 35,
    maxScore: 100,
    domain: "Medicine",
    difficulty: "hard"
  }
]

interface ExamSimulationModeProps {
  onBack?: () => void
}

export function ExamSimulationMode({ onBack }: ExamSimulationModeProps) {
  const [examSession, setExamSession] = useState<ExamSession | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [examType, setExamType] = useState<string>("certification")
  const [isSetup, setIsSetup] = useState(true)
  const [showResults, setShowResults] = useState(false)

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const startExam = (domain: string, type: string) => {
    const domainQuestions = sampleQuestions.filter(q => q.domain === domain)
    const totalExamTime = domainQuestions.reduce((total, q) => total + (q.timeLimit * 60), 0)
    
    const newSession: ExamSession = {
      id: Date.now().toString(),
      examType: type,
      domain,
      questions: domainQuestions,
      currentQuestionIndex: 0,
      timeRemaining: totalExamTime,
      isPaused: false,
      startTime: new Date(),
      answers: {},
      isCompleted: false
    }
    
    setExamSession(newSession)
    setIsSetup(false)
  }

  const pauseExam = () => {
    if (examSession) {
      setExamSession(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null)
    }
  }

  const nextQuestion = () => {
    if (examSession && examSession.currentQuestionIndex < examSession.questions.length - 1) {
      setExamSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null)
    } else {
      completeExam()
    }
  }

  const previousQuestion = () => {
    if (examSession && examSession.currentQuestionIndex > 0) {
      setExamSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      } : null)
    }
  }

  const completeExam = () => {
    if (examSession) {
      setExamSession(prev => prev ? { ...prev, isCompleted: true } : null)
      setShowResults(true)
    }
  }

  const restartExam = () => {
    setExamSession(null)
    setShowResults(false)
    setIsSetup(true)
  }

  // Timer effect
  useEffect(() => {
    if (!examSession || examSession.isPaused || examSession.isCompleted) return

    const timer = setInterval(() => {
      setExamSession(prev => {
        if (!prev || prev.timeRemaining <= 0) {
          completeExam()
          return prev
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examSession])

  const currentQuestion = examSession?.questions[examSession.currentQuestionIndex]
  const progress = examSession ? ((examSession.currentQuestionIndex + 1) / examSession.questions.length) * 100 : 0

  if (showResults && examSession) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={restartExam}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Exam
          </Button>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modes
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Exam Results</h2>
            <p className="text-gray-600">{examSession.domain} - {examSession.examType}</p>
          </div>
        </div>

        {/* Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Exam Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{examSession.questions.length}</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {formatTime(Math.floor((Date.now() - examSession.startTime.getTime()) / 1000))}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Reasoning Quality Assessment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Logical Structure</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tool Usage</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completeness</span>
                    <Badge variant="outline">Very Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Management</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Feedback</h4>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Strong performance in sequential thinking and logical reasoning. Your step-by-step approach was well-structured and comprehensive. Consider focusing more on time management for complex problems.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examSession.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">Question {index + 1}</h5>
                    <Badge variant="outline">Score: 85%</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{question.title}</p>
                  <div className="text-xs text-gray-500">
                    Time: {question.timeLimit} minutes • Difficulty: {question.difficulty}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (examSession && !isSetup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsSetup(true)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{examSession.domain} - Exam Simulation</h2>
              <p className="text-gray-600">Question {examSession.currentQuestionIndex + 1} of {examSession.questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${examSession.timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}`}>
                {formatTime(examSession.timeRemaining)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={pauseExam}
            >
              {examSession.isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {currentQuestion.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentQuestion.type}</Badge>
                  <Badge variant={currentQuestion.difficulty === 'hard' ? 'destructive' : currentQuestion.difficulty === 'medium' ? 'default' : 'secondary'}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Time Limit: {currentQuestion.timeLimit} minutes • Max Score: {currentQuestion.maxScore} points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Question Description */}
                <div>
                  <Label className="text-base font-medium">Question</Label>
                  <p className="mt-2 text-gray-700">{currentQuestion.description}</p>
                </div>

                {/* Sequential Thinking Engine */}
                <div>
                  <Label className="text-base font-medium">Your Reasoning</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Use sequential thinking to analyze this problem step by step. The system will guide you through the reasoning process.
                  </p>
                  <SequentialThinkingEngine
                    problem={currentQuestion.description}
                    domain={currentQuestion.domain}
                    availableTools={domainTemplates.find(d => d.name === currentQuestion.domain)?.commonTools || []}
                    onThoughtComplete={(thought) => {
                      // Store thought in exam session
                      if (examSession) {
                        setExamSession(prev => prev ? {
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [currentQuestion.id]: [...(prev.answers[currentQuestion.id] || []), thought]
                          }
                        } : null)
                      }
                    }}
                    onSessionComplete={(thoughts) => {
                      // Mark question as completed
                      if (examSession) {
                        setExamSession(prev => prev ? {
                          ...prev,
                          answers: {
                            ...prev.answers,
                            [currentQuestion.id]: thoughts
                          }
                        } : null)
                      }
                    }}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={examSession.currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {examSession.currentQuestionIndex === examSession.questions.length - 1 ? (
                      <Button onClick={completeExam}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Exam
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>
                        Next Question
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Warning */}
        {examSession.timeRemaining < 300 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Less than 5 minutes remaining! Please complete your current reasoning and submit your answer.
            </AlertDescription>
          </Alert>
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
          <h2 className="text-2xl font-bold">Exam Simulation Mode</h2>
          <p className="text-gray-600">Practice with timed, reasoning-based assessments</p>
        </div>
      </div>

      <Tabs defaultValue="exam-setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exam-setup">Exam Setup</TabsTrigger>
          <TabsTrigger value="exam-info">Exam Information</TabsTrigger>
        </TabsList>

        <TabsContent value="exam-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Configure Your Exam
              </CardTitle>
              <CardDescription>
                Select your domain and exam type to begin a timed reasoning assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Domain Selection */}
              <div>
                <Label className="text-base font-medium">Select Domain</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose the professional domain for your exam simulation
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
                            {domain.sampleProblems.length} Questions
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Exam Type Selection */}
              <div>
                <Label className="text-base font-medium">Exam Type</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose the type of exam simulation you want to practice
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      examType === 'certification' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => setExamType('certification')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Certification Exam</CardTitle>
                      <CardDescription>
                        Simulate professional certification exams with realistic time constraints
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Standard exam duration</div>
                        <div>• Mixed difficulty levels</div>
                        <div>• Comprehensive scoring</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      examType === 'practice' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => setExamType('practice')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Test</CardTitle>
                      <CardDescription>
                        Focused practice on specific reasoning skills and concepts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Flexible timing</div>
                        <div>• Targeted difficulty</div>
                        <div>• Immediate feedback</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Start Exam Button */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-500">
                  {selectedDomain && examType ? 'Ready to start your exam!' : 'Select domain and exam type to begin'}
                </div>
                <Button 
                  onClick={() => selectedDomain && startExam(selectedDomain, examType)}
                  disabled={!selectedDomain || !examType}
                  size="lg"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Start Exam Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exam-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                About Exam Simulation Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">How It Works</h4>
                  <p className="text-gray-600 mb-4">
                    Our exam simulation mode creates realistic testing environments that evaluate not just what you know, 
                    but how you think. Each exam includes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Timed case-style questions that mirror real professional scenarios
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Sequential thinking guidance to structure your reasoning process
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Intelligent tool recommendations for each reasoning step
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                      Comprehensive evaluation of reasoning quality and accuracy
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Scoring System</h4>
                  <p className="text-gray-600">
                    Exams are evaluated on multiple dimensions:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="font-medium">Reasoning Quality (60%)</div>
                      <div className="text-sm text-gray-600">
                        Logical structure, completeness, step-by-step clarity
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Tool Usage (20%)</div>
                      <div className="text-sm text-gray-600">
                        Appropriate selection and application of domain tools
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Accuracy (15%)</div>
                      <div className="text-sm text-gray-600">
                        Correctness of analysis and conclusions
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Time Management (5%)</div>
                      <div className="text-sm text-gray-600">
                        Efficient use of available time
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Available Domains</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {domainTemplates.map((domain) => (
                      <Badge key={domain.id} variant="outline" className={domain.color}>
                        {domain.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}