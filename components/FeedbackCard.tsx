'use client'

export type Feedback = {
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
    { label: 'Overall', value: feedback.overall_score },
    { label: 'Communication', value: feedback.communication },
    { label: 'Content', value: feedback.content_quality },
    { label: 'Confidence', value: feedback.confidence },
    { label: 'Relevance', value: feedback.relevance },
  ]

  const scoreColor = (s: number) =>
    s >= 8 ? '#4f7f52' : s >= 6 ? '#b7791f' : '#b25244'

  const scoreLabel = (s: number) =>
    s >= 8 ? 'Strong' : s >= 6 ? 'Good' : s >= 4 ? 'Fair' : 'Weak'

  return (
    <div className="feedback-wrap">
      <div className="verdict-banner">
        <span className="verdict-icon">Result</span>
        <p className="verdict-text">{feedback.verdict}</p>
      </div>

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

      <div className="section-block">
        <h3 className="section-title">Your answer transcript</h3>
        <p className="transcript-text">{feedback.transcript}</p>
      </div>

      <div className="section-block">
        <h3 className="section-title strength-title">What you did well</h3>
        <ul className="feedback-list">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="feedback-item strength-item">{s}</li>
          ))}
        </ul>
      </div>

      <div className="section-block">
        <h3 className="section-title improve-title">What to improve</h3>
        <ul className="feedback-list">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="feedback-item improve-item">{s}</li>
          ))}
        </ul>
      </div>

      <div className="section-block better-block">
        <h3 className="section-title">A stronger answer would sound like</h3>
        <p className="better-text">{feedback.sample_better_answer}</p>
      </div>
    </div>
  )
}
