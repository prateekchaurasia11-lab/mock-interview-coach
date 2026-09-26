'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Feedback = {
  communication?: number
  content_quality?: number
  confidence?: number
  verdict?: string
  improvements?: string[]
}

type Session = {
  id: string
  question: string
  transcript: string
  score: number
  feedback: Feedback
  created_at: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/history')
      .then((response) => response.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scoreColor = (score: number) =>
    score >= 8 ? '#4f7f52' : score >= 6 ? '#b7791f' : '#b25244'

  const average = sessions.length > 0
    ? Math.round(sessions.reduce((total, session) => total + (session.score ?? 0), 0) / sessions.length * 10) / 10
    : 0

  return (
    <main className="history-main">
      <div className="history-topbar">
        <Link href="/" className="back-link">Back home</Link>
        <div>
          <span className="eyebrow">Practice archive</span>
          <h1 className="history-title">Interview history</h1>
        </div>
      </div>

      {loading && <div className="loading-screen">Loading sessions...</div>}

      {!loading && sessions.length === 0 && (
        <div className="empty-state">
          <p className="empty-icon">No sessions yet</p>
          <p className="empty-text">Your completed interview reviews will appear here.</p>
          <Link href="/interview" className="button button-primary">Start your first interview</Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <>
          <div className="stats-row history-stats">
            <div className="stat-card">
              <div className="stat-num">{sessions.length}</div>
              <div className="stat-label">Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: scoreColor(average) }}>{average}</div>
              <div className="stat-label">Avg score</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{sessions.filter((session) => session.score >= 7).length}</div>
              <div className="stat-label">Scored 7+</div>
            </div>
          </div>

          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-card">
                <button
                  className="session-header"
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                  aria-expanded={expanded === session.id}
                >
                  <div className="session-info">
                    <p className="session-question">{session.question}</p>
                    <p className="session-date">
                      {new Date(session.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="session-right">
                    <div className="session-score" style={{ color: scoreColor(session.score) }}>
                      {session.score}/10
                    </div>
                    <div className="session-chevron">{expanded === session.id ? 'Close' : 'Open'}</div>
                  </div>
                </button>

                {expanded === session.id && session.feedback && (
                  <div className="session-detail">
                    <p className="detail-transcript">{session.transcript}</p>
                    <div className="detail-scores">
                      {[
                        ['Communication', session.feedback.communication],
                        ['Content', session.feedback.content_quality],
                        ['Confidence', session.feedback.confidence],
                      ].map(([label, value]) => (
                        <div key={label as string} className="detail-score-item">
                          <span>{label}</span>
                          <span style={{ color: scoreColor(value as number), fontWeight: 700 }}>
                            {value}/10
                          </span>
                        </div>
                      ))}
                    </div>
                    {session.feedback.verdict && (
                      <p className="detail-verdict">{session.feedback.verdict}</p>
                    )}
                    {session.feedback.improvements && session.feedback.improvements.length > 0 && (
                      <div>
                        <p className="detail-section-label">To improve:</p>
                        {session.feedback.improvements.map((improvement, index) => (
                          <p key={index} className="detail-improve-item">{improvement}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="history-footer">
        <Link href="/interview" className="button button-primary">Practice again</Link>
      </div>
    </main>
  )
}
