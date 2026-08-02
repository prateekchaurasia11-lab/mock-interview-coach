'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Recorder from '@/components/Recorder'
import FeedbackCard from '@/components/FeedbackCard'
import { questions, Question } from '@/lib/questions'

type Stage = 'question' | 'recorded' | 'transcribing' | 'grading' | 'feedback'

function InterviewContent() {
  const searchParams = useSearchParams()
  const category = (searchParams.get('category') ?? 'hr') as Question['category']
  const filtered = questions.filter((q) => q.category === category)

  const [qIndex, setQIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('question')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const currentQ = filtered[qIndex]

  async function handleGetFeedback() {
    if (!audioBlob || !currentQ) return
    setError(null)

    try {
      setStage('transcribing')
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      const transcribeData = await transcribeRes.json()

      if (!transcribeRes.ok || transcribeData.error) {
        throw new Error(transcribeData.error || 'Transcription failed')
      }

      const text: string = transcribeData.text ?? ''
      if (!text || text.trim().length < 5) {
        throw new Error('Could not hear your answer. Please re-record and speak clearly.')
      }

      setStage('grading')
      const gradeRes = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          question: currentQ.question,
          category: currentQ.category,
        }),
      })
      const feedbackData = await gradeRes.json()

      if (!gradeRes.ok || feedbackData.error) {
        throw new Error(feedbackData.error || 'Grading failed')
      }

      setFeedback({ ...feedbackData, transcript: text })
      setStage('feedback')
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
      setStage('recorded')
    }
  }

  function nextQuestion() {
    setQIndex(qIndex < filtered.length - 1 ? qIndex + 1 : 0)
    setStage('question')
    setAudioBlob(null)
    setFeedback(null)
    setError(null)
  }

  const categoryLabels: Record<string, string> = {
    hr: 'HR & Behavioural',
    technical: 'Technical',
    dsa: 'DSA & Algorithms',
  }

  return (
    <main className="interview-main">
      <div className="interview-topbar">
        <Link href="/" className="back-link">← Home</Link>
        <div className="category-pill">{categoryLabels[category]}</div>
        <div className="q-counter">{qIndex + 1} / {filtered.length}</div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill"
          style={{ width: `${((qIndex + 1) / filtered.length) * 100}%` }} />
      </div>

      <div className="question-card">
        <div className="difficulty-badge" data-level={currentQ?.difficulty}>
          {currentQ?.difficulty}
        </div>
        <h2 className="question-text">{currentQ?.question}</h2>
        <p className="question-hint">💡 {currentQ?.hint}</p>
      </div>

      {/* STEP 1: Record karo */}
      {(stage === 'question' || stage === 'recorded') && (
        <div className="recorder-section">
          <Recorder
            onRecordingDone={(blob) => {
              setAudioBlob(blob)
              setStage('recorded')
            }}
            onReset={() => {
              setAudioBlob(null)
              setStage('question')
              setError(null)
            }}
          />

          {error && (
            <div className="error-banner" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {/* Only show button AFTER recording is done */}
          {stage === 'recorded' && audioBlob && (
            <button className="btn-submit" onClick={handleGetFeedback}>
              Get AI Feedback →
            </button>
          )}
        </div>
      )}

      {/* STEP 2: Processing */}
      {(stage === 'transcribing' || stage === 'grading') && (
        <div className="processing-ui">
          <div className="spinner" />
          <p className="processing-label">
            {stage === 'transcribing' ? 'Transcribing your answer…' : 'Grading with AI…'}
          </p>
          <p className="processing-sub">
            {stage === 'transcribing'
              ? 'Groq Whisper: audio → text'
              : 'OpenRouter LLM: scoring your response'}
          </p>
        </div>
      )}

      {/* STEP 3: Feedback */}
      {stage === 'feedback' && feedback && (
        <div className="feedback-section">
          <FeedbackCard feedback={feedback} />
          <div className="next-actions">
            <button className="btn-next" onClick={nextQuestion}>
              {qIndex < filtered.length - 1 ? 'Next Question →' : 'Start Over →'}
            </button>
            <Link href="/history" className="btn-ghost-sm">View History</Link>
          </div>
        </div>
      )}
    </main>
  )
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="loading-screen">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  )
}