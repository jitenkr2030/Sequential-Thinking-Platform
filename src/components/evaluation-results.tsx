"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Brain, 
  Target, 
  Zap,
  Award,
  BookOpen,
  Lightbulb,
  ArrowLeft,
  RefreshCw
} from "lucide-react"

interface EvaluationResult {
  overallScore: number
  reasoningScore: number
  toolUsageScore: number
  accuracyScore: number
  timeScore: number
  feedback: {
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  }
  detailedAnalysis: {
    logicalStructure: {
      score: number
      feedback: string
    }
    completeness: {
      score: number
      feedback: string
    }
    toolApplication: {
      score: number
      feedback: string
    }
    conclusionQuality: {
      score: number
      feedback: string
    }
  }
}

interface EvaluationResultsProps {
  results: EvaluationResult
  onBack?: () => void
  onRetry?: () => void
  domain?: string
  problem?: string
}

export function EvaluationResults({ 
  results, 
  onBack, 
  onRetry, 
  domain = "Unknown Domain", 
  problem = "Unknown Problem" 
}: EvaluationResultsProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 80) return CheckCircle
    if (score >= 70) return AlertCircle
    return XCircle
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Good"
    if (score >= 70) return "Fair"
    return "Needs Improvement"
  }

  const ScoreIcon = getScoreIcon(results.overallScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Evaluation Results</h2>
            <p className="text-gray-600">{domain} • Reasoning Assessment</p>
          </div>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={() => {
              setIsRetrying(true)
              onRetry()
            }}
            disabled={isRetrying}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry Evaluation
          </Button>
        )}
      </div>

      {/* Overall Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ScoreIcon className={`h-6 w-6 ${getScoreColor(results.overallScore)}`} />
            <div>
              <span className="text-3xl font-bold">{results.overallScore}%</span>
              <Badge 
                variant="outline" 
                className={`ml-2 ${getScoreColor(results.overallScore)}`}
              >
                {getScoreLabel(results.overallScore)}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Overall reasoning quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-blue-600 mr-2" />
                <span className={`text-2xl font-bold ${getScoreColor(results.reasoningScore)}`}>
                  {results.reasoningScore}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Reasoning</div>
              <div className="text-xs text-gray-500">60% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className={`text-2xl font-bold ${getScoreColor(results.toolUsageScore)}`}>
                  {results.toolUsageScore}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Tool Usage</div>
              <div className="text-xs text-gray-500">20% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className={`text-2xl font-bold ${getScoreColor(results.accuracyScore)}`}>
                  {results.accuracyScore}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-xs text-gray-500">15% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                <span className={`text-2xl font-bold ${getScoreColor(results.timeScore)}`}>
                  {results.timeScore}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Time Mgmt</div>
              <div className="text-xs text-gray-500">5% weight</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="detailed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Logical Structure
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={results.detailedAnalysis.logicalStructure.score} className="flex-1" />
                  <span className={`font-medium ${getScoreColor(results.detailedAnalysis.logicalStructure.score)}`}>
                    {results.detailedAnalysis.logicalStructure.score}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {results.detailedAnalysis.logicalStructure.feedback}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Completeness
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={results.detailedAnalysis.completeness.score} className="flex-1" />
                  <span className={`font-medium ${getScoreColor(results.detailedAnalysis.completeness.score)}`}>
                    {results.detailedAnalysis.completeness.score}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {results.detailedAnalysis.completeness.feedback}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Tool Application
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={results.detailedAnalysis.toolApplication.score} className="flex-1" />
                  <span className={`font-medium ${getScoreColor(results.detailedAnalysis.toolApplication.score)}`}>
                    {results.detailedAnalysis.toolApplication.score}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {results.detailedAnalysis.toolApplication.feedback}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Conclusion Quality
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress value={results.detailedAnalysis.conclusionQuality.score} className="flex-1" />
                  <span className={`font-medium ${getScoreColor(results.detailedAnalysis.conclusionQuality.score)}`}>
                    {results.detailedAnalysis.conclusionQuality.score}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {results.detailedAnalysis.conclusionQuality.feedback}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.feedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.feedback.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{improvement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-5 w-5" />
                Suggestions for Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.feedback.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended Next Steps:</strong> Based on your evaluation, focus on practicing 
              problems that challenge your {results.detailedAnalysis.logicalStructure.score < 80 ? 'logical structure' : 
              results.detailedAnalysis.completeness.score < 80 ? 'completeness' : 
              results.detailedAnalysis.toolApplication.score < 80 ? 'tool application' : 'conclusion quality'}. 
              Continue with sequential thinking exercises to reinforce these skills.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}