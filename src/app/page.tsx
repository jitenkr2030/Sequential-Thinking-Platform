"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, Users, Brain, Globe, Target, BarChart3, WifiOff, MessageSquare } from "lucide-react"
import { SelfStudyMode } from "@/components/self-study-mode"
import { ExamSimulationMode } from "@/components/exam-simulation-mode"
import { TeachingMode } from "@/components/teaching-mode"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { OfflineLearningMode } from "@/components/offline-learning-mode"
import { CollaborationDashboard } from "@/components/collaboration/collaboration-dashboard"

type PlatformMode = 'home' | 'self-study' | 'exam-simulation' | 'teaching' | 'analytics' | 'offline' | 'collaboration'

export default function Home() {
  const [currentMode, setCurrentMode] = useState<PlatformMode>('home')

  const modes = [
    {
      id: "self-study",
      title: "Self-Study Mode",
      description: "Learn step-by-step reasoning with AI guidance",
      icon: BookOpen,
      color: "bg-blue-500",
      features: [
        "Interactive problem-solving",
        "AI-powered hints and explanations",
        "Progress tracking",
        "Multi-domain support"
      ]
    },
    {
      id: "exam-simulation",
      title: "Exam Simulation Mode",
      description: "Practice with timed, reasoning-based assessments",
      icon: GraduationCap,
      color: "bg-green-500",
      features: [
        "Real exam conditions",
        "Reasoning quality evaluation",
        "Performance analytics",
        "Certification preparation"
      ]
    },
    {
      id: "teaching",
      title: "Teaching & Coaching Mode",
      description: "Design and monitor reasoning learning paths",
      icon: Users,
      color: "bg-purple-500",
      features: [
        "Create reasoning maps",
        "Monitor student progress",
        "Customizable scenarios",
        "Collaborative learning"
      ]
    },
    {
      id: "analytics",
      title: "Analytics Dashboard",
      description: "View reasoning insights and progress tracking",
      icon: BarChart3,
      color: "bg-orange-500",
      features: [
        "Performance metrics",
        "Domain analysis",
        "Tool usage statistics",
        "Learning progress tracking"
      ]
    },
    {
      id: "offline",
      title: "Offline Learning Mode",
      description: "Continue learning without internet connection",
      icon: WifiOff,
      color: "bg-gray-500",
      features: [
        "Downloaded reasoning maps",
        "Offline progress tracking",
        "No internet required",
        "Automatic sync when online"
      ]
    },
    {
      id: "collaboration",
      title: "Collaboration Hub",
      description: "Connect with peers and experts in real-time",
      icon: MessageSquare,
      color: "bg-indigo-500",
      features: [
        "Study groups with real-time collaboration",
        "Peer review and feedback system",
        "Live instructor sessions",
        "Domain-specific discussion forums"
      ]
    }
  ]

  const domains = [
    { name: "Finance & Accounting", icon: "📊", color: "bg-emerald-100 text-emerald-800" },
    { name: "Law", icon: "⚖️", color: "bg-blue-100 text-blue-800" },
    { name: "Medicine", icon: "🏥", color: "bg-red-100 text-red-800" },
    { name: "Engineering", icon: "⚙️", color: "bg-gray-100 text-gray-800" },
    { name: "Data Science", icon: "📈", color: "bg-indigo-100 text-indigo-800" },
    { name: "Business", icon: "💼", color: "bg-amber-100 text-amber-800" }
  ]

  const handleModeSelect = (modeId: string) => {
    setCurrentMode(modeId as PlatformMode)
  }

  const handleBackToHome = () => {
    setCurrentMode('home')
  }

  // Render the current mode
  if (currentMode === 'self-study') {
    return <SelfStudyMode onBack={handleBackToHome} />
  }

  if (currentMode === 'exam-simulation') {
    return <ExamSimulationMode onBack={handleBackToHome} />
  }

  if (currentMode === 'teaching') {
    return <TeachingMode onBack={handleBackToHome} />
  }

  if (currentMode === 'analytics') {
    return <AnalyticsDashboard onBack={handleBackToHome} />
  }

  if (currentMode === 'offline') {
    return <OfflineLearningMode onBack={handleBackToHome} />
  }

  if (currentMode === 'collaboration') {
    return <CollaborationDashboard currentUser={{
      id: "current-user",
      name: "Current User",
      role: "student",
      online: true,
      lastSeen: Date.now()
    }} onBack={handleBackToHome} />
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sequential Thinking Platform</h1>
                <p className="text-sm text-gray-600">Global Education & Exam Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex">
                <Globe className="w-3 h-3 mr-1" />
                Multi-Domain
              </Badge>
              <Badge variant="outline" className="hidden sm:flex">
                <Target className="w-3 h-3 mr-1" />
                Reasoning-Focused
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transform Learning Through
              <span className="text-blue-600"> Sequential Thinking</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Move beyond rote memorization. Master professional reasoning through structured, 
              step-by-step problem-solving across finance, law, medicine, engineering, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Badge variant="secondary" className="text-sm">AI-Powered</Badge>
              <Badge variant="secondary" className="text-sm">Multi-Domain</Badge>
              <Badge variant="secondary" className="text-sm">Reasoning-Focused</Badge>
              <Badge variant="secondary" className="text-sm">Global Standards</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modes */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Mode</h3>
            <p className="text-lg text-gray-600">Select the mode that best fits your learning goals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 max-w-8xl mx-auto">
            {modes.map((mode) => {
              const Icon = mode.icon
              return (
                <Card 
                  key={mode.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    currentMode === mode.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${mode.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mode.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-4" 
                      variant={currentMode === mode.id ? "default" : "outline"}
                      onClick={() => {
                        if (mode.id === 'self-study') {
                          window.location.href = '/self-study'
                        } else if (mode.id === 'exam-simulation') {
                          window.location.href = '/exam-simulation'
                        } else if (mode.id === 'teaching') {
                          window.location.href = '/teaching'
                        }
                      }}
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Supported Domains */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Supported Learning Domains</h3>
            <p className="text-lg text-gray-600">Professional reasoning across multiple disciplines</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {domains.map((domain, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{domain.icon}</div>
                  <h4 className="font-medium text-sm text-gray-900">{domain.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h3>
            <p className="text-lg text-gray-600">Everything you need for reasoning-based learning</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Sequential Thinking Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Powered by mcp-sequentialthinking-tools for structured, step-by-step reasoning guidance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">Intelligent Tool Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI suggests relevant formulas, laws, standards, and methods for each reasoning step
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">Multi-Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Learn in your preferred language with global accessibility and localization
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-amber-600 mb-2" />
                <CardTitle className="text-lg">Adaptive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Personalized difficulty and content based on your progress and learning style
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <GraduationCap className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle className="text-lg">Exam Preparation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Realistic exam simulations with reasoning quality evaluation and feedback
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive reasoning insights and progress tracking with detailed analytics
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of learners mastering professional reasoning through structured thinking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-blue-600">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold">Sequential Thinking Platform</span>
            </div>
            <div className="text-sm text-gray-400">
              Powered by mcp-sequentialthinking-tools • Building Global Reasoning Intelligence
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}