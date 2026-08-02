'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Session = {
  id: string
  question: string
  transcript: string
  score: number
  feedback: any
  created_at: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scoreColor = (s: number) =>
    s >= 8 ? '#22c55e' : s >= 6 ? '#f59e0b' : '#ef4444'

  const avg = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + (s.score ?? 0), 0) / sessions.length * 10) / 10
    : 0

  return (
    <main className="history-main">
      <div className="history-topbar">
        <Link href="/" className="back-link">← Home</Link>
        <h1 className="history-title">Practice History</h1>
      </div>

      {loading && <div className="loading-screen">Loading sessions…</div>}

      {!loading && sessions.length === 0 && (
        <div className="empty-state">
          <p className="empty-icon">🎤</p>
          <p className="empty-text">No sessions yet.</p>
          <Link href="/interview" className="btn-primary">Start your first interview →</Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num">{sessions.length}</div>
              <div className="stat-label">Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: scoreColor(avg) }}>{avg}</div>
              <div className="stat-label">Avg Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{sessions.filter((s) => s.score >= 7).length}</div>
              <div className="stat-label">Scored 7+</div>
            </div>
          </div>

          <div className="sessions-list">
            {sessions.map((s) => (
              <div key={s.id} className="session-card">
                <div className="session-header"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  <div className="session-info">
                    <p className="session-question">{s.question}</p>
                    <p className="session-date">
                      {new Date(s.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="session-right">
                    <div className="session-score" style={{ color: scoreColor(s.score) }}>
                      {s.score}/10
                    </div>
                    <div className="session-chevron">{expanded === s.id ? '▲' : '▼'}</div>
                  </div>
                </div>

                {expanded === s.id && s.feedback && (
                  <div className="session-detail">
                    <p className="detail-transcript">{s.transcript}</p>
                    <div className="detail-scores">
                      {[
                        ['Communication', s.feedback.communication],
                        ['Content', s.feedback.content_quality],
                        ['Confidence', s.feedback.confidence],
                      ].map(([label, val]) => (
                        <div key={label as string} className="detail-score-item">
                          <span>{label}</span>
                          <span style={{ color: scoreColor(val as number), fontWeight: 600 }}>
                            {val}/10
                          </span>
                        </div>
                      ))}
                    </div>
                    {s.feedback.verdict && (
                      <p className="detail-verdict">🎯 {s.feedback.verdict}</p>
                    )}
                    {s.feedback.improvements?.length > 0 && (
                      <div>
                        <p className="detail-section-label">To improve:</p>
                        {s.feedback.improvements.map((imp: string, i: number) => (
                          <p key={i} className="detail-improve-item">→ {imp}</p>
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
        <Link href="/interview" className="btn-primary">Practice Again →</Link>
      </div>
    </main>
  )
}