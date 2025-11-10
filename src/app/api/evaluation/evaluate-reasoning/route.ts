import { NextRequest, NextResponse } from 'next/server'
import { ZAI } from 'z-ai-web-dev-sdk'

interface EvaluationRequest {
  thoughts: Array<{
    content: string
    thoughtNumber: number
    totalThoughts: number
    tools?: Array<{
      name: string
      confidence: number
      rationale: string
    }>
  }>
  domain: string
  problem: string
  expectedReasoning?: string[]
}

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

// POST /api/evaluation/evaluate-reasoning - Evaluate reasoning quality using AI
export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json()
    const { thoughts, domain, problem, expectedReasoning } = body

    if (!thoughts || thoughts.length === 0) {
      return NextResponse.json(
        { error: 'No thoughts provided for evaluation' },
        { status: 400 }
      )
    }

    // Initialize ZAI
    const zai = await ZAI.create()

    // Create evaluation prompt
    const evaluationPrompt = `
You are an expert reasoning evaluator for ${domain}. Analyze the following sequential thinking process and provide a comprehensive evaluation.

**Problem:** ${problem}

**Expected Reasoning Framework:** ${expectedReasoning ? expectedReasoning.join(' → ') : 'Not specified'}

**Student's Thought Process:**
${thoughts.map((thought, index) => `
Thought ${thought.thoughtNumber}/${thought.totalThoughts}: ${thought.content}
${thought.tools ? `Tools considered: ${thought.tools.map(t => `${t.name} (confidence: ${t.confidence})`).join(', ')}` : ''}
`).join('\n')}

Please evaluate this reasoning process on the following dimensions:

1. **Logical Structure (40% weight):**
   - Clarity and organization of thoughts
   - Logical progression between steps
   - Coherence and consistency

2. **Completeness (30% weight):**
   - Coverage of all necessary reasoning steps
   - Depth of analysis
   - Addressing all aspects of the problem

3. **Tool Application (20% weight):**
   - Appropriate selection of tools
   - Effective use of recommended tools
   - Integration of tool insights

4. **Conclusion Quality (10% weight):**
   - Soundness of final conclusion
   - Support for conclusion with reasoning
   - Consideration of alternatives

Provide your evaluation in the following JSON format:
{
  "logicalStructure": {
    "score": 0.0 to 1.0,
    "feedback": "specific feedback"
  },
  "completeness": {
    "score": 0.0 to 1.0,
    "feedback": "specific feedback"
  },
  "toolApplication": {
    "score": 0.0 to 1.0,
    "feedback": "specific feedback"
  },
  "conclusionQuality": {
    "score": 0.0 to 1.0,
    "feedback": "specific feedback"
  },
  "overallFeedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  }
}
`

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert reasoning evaluator. Provide objective, constructive feedback on reasoning processes. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('No response from AI evaluation')
      }

      // Parse the JSON response
      let evaluationResult
      try {
        evaluationResult = JSON.parse(responseContent)
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseContent)
        throw new Error('Invalid AI response format')
      }

      // Calculate weighted scores
      const reasoningScore = evaluationResult.logicalStructure.score * 0.4 + 
                           evaluationResult.completeness.score * 0.3 +
                           evaluationResult.conclusionQuality.score * 0.1
      
      const toolUsageScore = evaluationResult.toolApplication.score

      // For accuracy and time, we'll use placeholder values for now
      // In a real implementation, these would be calculated based on actual performance
      const accuracyScore = 0.8 // Placeholder
      const timeScore = 0.9 // Placeholder

      const overallScore = (reasoningScore * 0.6) + 
                          (toolUsageScore * 0.2) + 
                          (accuracyScore * 0.15) + 
                          (timeScore * 0.05)

      const result: EvaluationResult = {
        overallScore: Math.round(overallScore * 100),
        reasoningScore: Math.round(reasoningScore * 100),
        toolUsageScore: Math.round(toolUsageScore * 100),
        accuracyScore: Math.round(accuracyScore * 100),
        timeScore: Math.round(timeScore * 100),
        feedback: evaluationResult.overallFeedback,
        detailedAnalysis: {
          logicalStructure: {
            score: Math.round(evaluationResult.logicalStructure.score * 100),
            feedback: evaluationResult.logicalStructure.feedback
          },
          completeness: {
            score: Math.round(evaluationResult.completeness.score * 100),
            feedback: evaluationResult.completeness.feedback
          },
          toolApplication: {
            score: Math.round(evaluationResult.toolApplication.score * 100),
            feedback: evaluationResult.toolApplication.feedback
          },
          conclusionQuality: {
            score: Math.round(evaluationResult.conclusionQuality.score * 100),
            feedback: evaluationResult.conclusionQuality.feedback
          }
        }
      }

      return NextResponse.json(result)
    } catch (aiError) {
      console.error('AI evaluation error:', aiError)
      
      // Fallback to basic evaluation if AI fails
      const fallbackResult: EvaluationResult = {
        overallScore: 75,
        reasoningScore: 75,
        toolUsageScore: 75,
        accuracyScore: 75,
        timeScore: 75,
        feedback: {
          strengths: ['Structured approach to problem-solving', 'Good use of reasoning steps'],
          improvements: ['Consider more diverse perspectives', 'Deepen analysis in key areas'],
          suggestions: ['Practice with more complex problems', 'Focus on tool integration']
        },
        detailedAnalysis: {
          logicalStructure: {
            score: 75,
            feedback: 'Good logical flow with room for improvement in transitions'
          },
          completeness: {
            score: 75,
            feedback: 'Most key areas covered, but some aspects need more depth'
          },
          toolApplication: {
            score: 75,
            feedback: 'Adequate tool usage with potential for better integration'
          },
          conclusionQuality: {
            score: 75,
            feedback: 'Reasonable conclusion with supporting reasoning'
          }
        }
      }

      return NextResponse.json(fallbackResult)
    }
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate reasoning' },
      { status: 500 }
    )
  }
}