'use client'

type Feedback = {
  overall_score: number
  communication: number
  content_quality: number
  confidence: number
  relevance: number
  strengths: string[]
  improvements: string[]
  sample_better_answer: string
  verdict: string
  transcript: string
}

export default function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const scores = [
    { label: 'Overall', value: feedback.overall_score, key: 'overall' },
    { label: 'Communication', value: feedback.communication, key: 'comm' },
    { label: 'Content', value: feedback.content_quality, key: 'content' },
    { label: 'Confidence', value: feedback.confidence, key: 'conf' },
    { label: 'Relevance', value: feedback.relevance, key: 'rel' },
  ]

  const scoreColor = (s: number) =>
    s >= 8 ? '#22c55e' : s >= 6 ? '#f59e0b' : '#ef4444'

  const scoreLabel = (s: number) =>
    s >= 8 ? 'Strong' : s >= 6 ? 'Good' : s >= 4 ? 'Fair' : 'Weak'

  return (
    <div className="feedback-wrap">
      {/* Verdict banner */}
      <div className="verdict-banner">
        <span className="verdict-icon">🎯</span>
        <p className="verdict-text">{feedback.verdict}</p>
      </div>

      {/* Score grid */}
      <div className="score-grid">
        {scores.map(({ label, value }) => (
          <div key={label} className="score-card">
            <div className="score-num" style={{ color: scoreColor(value) }}>
              {value}<span className="score-denom">/10</span>
            </div>
            <div className="score-label">{label}</div>
            <div className="score-badge" style={{ color: scoreColor(value) }}>
              {scoreLabel(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Transcript */}
      <div className="section-block">
        <h3 className="section-title">Your Answer (Transcript)</h3>
        <p className="transcript-text">{feedback.transcript}</p>
      </div>

      {/* Strengths */}
      <div className="section-block">
        <h3 className="section-title strength-title">✓ What you did well</h3>
        <ul className="feedback-list">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="feedback-item strength-item">{s}</li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="section-block">
        <h3 className="section-title improve-title">→ What to improve</h3>
        <ul className="feedback-list">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="feedback-item improve-item">{s}</li>
          ))}
        </ul>
      </div>

      {/* Better answer */}
      <div className="section-block better-block">
        <h3 className="section-title">💡 A stronger answer would sound like</h3>
        <p className="better-text">{feedback.sample_better_answer}</p>
      </div>
    </div>
  )
}
