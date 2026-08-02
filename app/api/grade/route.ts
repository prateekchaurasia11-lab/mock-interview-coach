import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { transcript, question, category } = await request.json()

    if (!transcript || !question) {
      return NextResponse.json({ error: 'transcript and question required' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30 sec timeout


    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'Mock Interview Coach',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach. Evaluate the candidate's answer.
Return ONLY valid JSON, nothing else:
{
  "overall_score": <1-10>,
  "communication": <1-10>,
  "content_quality": <1-10>,
  "confidence": <1-10>,
  "relevance": <1-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "sample_better_answer": "a better answer example",
  "verdict": "one sentence verdict"
}`,
          },
          {
            role: 'user',
            content: `Category: ${category}\nQuestion: ${question}\nAnswer: ${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: `LLM failed: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'Empty response from LLM' }, { status: 500 })
    }

    const feedback = JSON.parse(content)

    // Save to Supabase — silently fail if error
    try {
      await supabase.from('sessions').insert({
        question,
        transcript,
        feedback,
        score: feedback.overall_score,
        user_id: 'guest',
      })
    } catch (dbErr) {
      console.warn('Supabase save skipped:', dbErr)
    }

    return NextResponse.json(feedback)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 504 })
    }
    console.error('Grading error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}