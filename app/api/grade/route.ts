import { NextResponse } from 'next/server'

const fillerPattern = /\b(um|uh|like|basically|actually|you know)\b/gi
const ignoredWords = new Set(['about', 'could', 'would', 'should', 'their', 'there', 'these', 'those', 'what', 'when', 'where', 'which', 'with', 'your'])

function clamp(value: number) {
  return Math.round(Math.min(10, Math.max(1, value)) * 10) / 10
}

function localReview(transcript: string, question: string) {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const fillerCount = transcript.match(fillerPattern)?.length ?? 0
  const answerWords = new Set(words.map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, '')))
  const questionKeywords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 4 && !ignoredWords.has(word))
  const overlap = questionKeywords.filter((word) => answerWords.has(word)).length

  const communication = clamp(5.5 + Math.min(2, words.length / 50) - Math.min(2.5, fillerCount * 0.35))
  const contentQuality = clamp(4.5 + Math.min(4, words.length / 28))
  const confidence = clamp(6 + (words.length >= 45 ? 1 : 0) - Math.min(3, fillerCount * 0.45))
  const relevance = clamp(5.5 + Math.min(3, overlap * 0.8))
  const overallScore = clamp((communication + contentQuality + confidence + relevance) / 4)

  const strengths = [
    words.length >= 45
      ? 'You gave the answer enough detail to communicate a complete thought.'
      : 'You kept the answer direct and easy to follow.',
    fillerCount <= 2
      ? 'Your delivery avoided excessive filler language.'
      : 'You maintained a clear central point throughout the response.',
  ]

  const improvements = [
    words.length < 60
      ? 'Add one specific example, action, and measurable result to make the answer more convincing.'
      : 'Tighten repeated ideas so the strongest evidence lands sooner.',
    fillerCount > 2
      ? 'Pause briefly instead of using filler words; it will make the answer sound more confident.'
      : 'End with a short sentence that connects your example directly back to the role.',
  ]

  return {
    overall_score: overallScore,
    communication,
    content_quality: contentQuality,
    confidence,
    relevance,
    strengths,
    improvements,
    sample_better_answer: `Start with a direct response to "${question}" Then give one concrete situation, explain the action you personally took, and close with the result and what you learned.`,
    verdict: overallScore >= 8
      ? 'A strong response with a clear structure; a sharper result statement would make it interview-ready.'
      : overallScore >= 6
        ? 'A solid starting point that will improve with a more specific example and result.'
        : 'The core idea is present, but the answer needs clearer structure, evidence, and a direct conclusion.',
  }
}

export async function POST(request: Request) {
  try {
    const { transcript, question } = await request.json()

    if (typeof transcript !== 'string' || !transcript.trim() || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: 'A transcript and question are required.' }, { status: 400 })
    }

    return NextResponse.json(localReview(transcript, question))
  } catch (error) {
    console.error('Local grading error:', error)
    return NextResponse.json({ error: 'Could not review this answer. Please try again.' }, { status: 500 })
  }
}
