'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Recorder from '@/components/Recorder'
import FeedbackCard, { type Feedback } from '@/components/FeedbackCard'
import { questions, Question } from '@/lib/questions'

type Stage = 'question' | 'recorded' | 'transcribing' | 'grading' | 'feedback'

const categoryLabels: Record<Question['category'], string> = {
  hr: 'HR and Behavioural',
  technical: 'Technical',
  dsa: 'DSA and Algorithms',
}

const categories = Object.keys(categoryLabels) as Question['category'][]

async function readJsonResponse(response: Response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { error: 'The server returned an unreadable response. Please try again.' }
  }
}

function audioFileName(blob: Blob) {
  if (blob.type.includes('mp4')) return 'recording.mp4'
  if (blob.type.includes('mpeg')) return 'recording.mp3'
  if (blob.type.includes('ogg')) return 'recording.ogg'
  if (blob.type.includes('wav')) return 'recording.wav'
  return 'recording.webm'
}

function InterviewContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') as Question['category'] | null
  const category = categoryParam && categories.includes(categoryParam) ? categoryParam : 'hr'
  const filtered = questions.filter((q) => q.category === category)

  const [qIndex, setQIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('question')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentQ = filtered[qIndex] ?? filtered[0]

  async function handleGetFeedback() {
    if (!audioBlob || !currentQ) return
    setError(null)

    try {
      if (audioBlob.size < 1024) {
        throw new Error('The recording is too short. Please record again and speak clearly.')
      }

      let text = transcript
      if (!text) {
        setStage('transcribing')
        const formData = new FormData()
        formData.append('audio', audioBlob, audioFileName(audioBlob))

        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })
        const transcribeData = await readJsonResponse(transcribeRes)

        if (!transcribeRes.ok || transcribeData.error) {
          throw new Error(transcribeData.error || 'Transcription failed. Please try again.')
        }

        text = typeof transcribeData.text === 'string' ? transcribeData.text.trim() : ''
        if (text.length < 5) {
          throw new Error('Could not hear your answer. Please re-record and speak clearly.')
        }
        setTranscript(text)
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
      const feedbackData = await readJsonResponse(gradeRes)

      if (!gradeRes.ok || feedbackData.error) {
        throw new Error(feedbackData.error || 'Grading failed. Please try again.')
      }

      setFeedback({ ...feedbackData, transcript: text } as Feedback)
      setStage('feedback')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong.')
      setStage('recorded')
    }
  }

  function nextQuestion() {
    setQIndex(qIndex < filtered.length - 1 ? qIndex + 1 : 0)
    setStage('question')
    setAudioBlob(null)
    setTranscript('')
    setFeedback(null)
    setError(null)
  }

  return (
    <main className="interview-main">
      <div className="interview-topbar">
        <Link href="/" className="back-link">Back home</Link>
        <div className="category-pill">{categoryLabels[category]}</div>
        <div className="q-counter">{qIndex + 1} / {filtered.length}</div>
      </div>

      <div className="progress-bar-wrap" aria-label="Question progress">
        <div
          className="progress-bar-fill"
          style={{ width: `${((qIndex + 1) / filtered.length) * 100}%` }}
        />
      </div>

      <section className="question-card">
        <div className="question-meta">
          <span className="difficulty-badge" data-level={currentQ?.difficulty}>
            {currentQ?.difficulty}
          </span>
          <span className="question-number">Question {String(qIndex + 1).padStart(2, '0')}</span>
        </div>
        <h1 className="question-text">{currentQ?.question}</h1>
        <p className="question-hint">{currentQ?.hint}</p>
      </section>

      <div hidden={stage !== 'question' && stage !== 'recorded'}>
        <section className="recorder-section">
          <Recorder
            key={`${category}-${qIndex}`}
            onRecordingDone={(blob) => {
              setAudioBlob(blob)
              setTranscript('')
              setError(null)
              setStage('recorded')
            }}
            onReset={() => {
              setAudioBlob(null)
              setTranscript('')
              setStage('question')
              setError(null)
            }}
          />

          {error && (
            <div className="error-banner" role="alert" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {stage === 'recorded' && audioBlob && (
            <button className="btn-submit" onClick={handleGetFeedback}>
              {error ? 'Retry review' : 'Review my answer'}
            </button>
          )}
        </section>
      </div>

      {(stage === 'transcribing' || stage === 'grading') && (
        <section className="processing-ui">
          <div className="spinner" />
          <p className="processing-label">
            {stage === 'transcribing' ? 'Transcribing your answer' : 'Reviewing your answer'}
          </p>
          <p className="processing-sub">
            {stage === 'transcribing'
              ? 'Turning your recording into text'
              : 'Scoring clarity, confidence, relevance, and content'}
          </p>
        </section>
      )}

      {stage === 'feedback' && feedback && (
        <section className="feedback-section">
          <FeedbackCard feedback={feedback} />
          <div className="next-actions">
            <button className="btn-next" onClick={nextQuestion}>
              {qIndex < filtered.length - 1 ? 'Next question' : 'Start over'}
            </button>
            <Link href="/history" className="btn-ghost-sm">View history</Link>
          </div>
        </section>
      )}
    </main>
  )
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <InterviewContent />
    </Suspense>
  )
}
