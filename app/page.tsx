import Link from 'next/link'

const categories = [
  {
    id: 'hr',
    label: 'HR and Behavioural',
    icon: 'HR',
    desc: 'Self-intro, strengths, weaknesses, teamwork, and situation-based answers.',
    count: 5,
  },
  {
    id: 'technical',
    label: 'Technical Concepts',
    icon: 'TC',
    desc: 'React, APIs, databases, system design, and web fundamentals.',
    count: 5,
  },
  {
    id: 'dsa',
    label: 'DSA and Algorithms',
    icon: 'DS',
    desc: 'Data structures, complexity, search, sorting, and problem-solving approach.',
    count: 5,
  },
]

const steps = [
  { step: '01', title: 'Choose the round', desc: 'Pick HR, technical, or DSA practice based on what you want to sharpen.' },
  { step: '02', title: 'Answer out loud', desc: 'Record a short spoken response with the same pressure as a real interview.' },
  { step: '03', title: 'Review the feedback', desc: 'Get a transcript, scores, coaching notes, and a stronger sample answer.' },
]

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy reveal">
          <p className="eyebrow">AI interview practice</p>
          <h1>
            Mock Interview Coach for sharper <em>spoken answers.</em>
          </h1>
          <p className="hero-intro">
            Practice real interview questions, record your response, and get focused
            feedback on clarity, confidence, relevance, and content quality.
          </p>
          <div className="hero-actions">
            <Link href="/interview" className="button button-primary">
              Start practicing
            </Link>
            <Link href="/history" className="text-link">
              View history
            </Link>
          </div>
        </div>

        <div className="hero-panel reveal reveal-delay" aria-hidden="true">
          <div className="panel-topline">
            <span />
            <span />
            <span />
          </div>
          <div className="coach-meter">
            <strong>8.4</strong>
            <span>average feedback score</span>
          </div>
          <div className="panel-question">
            <span>Current prompt</span>
            Tell me about a challenging project and how you handled it.
          </div>
          <div className="panel-bars">
            <div style={{ width: '88%' }} />
            <div style={{ width: '74%' }} />
            <div style={{ width: '64%' }} />
          </div>
          <div className="panel-note">Transcript, scoring, and coaching notes in one flow.</div>
        </div>
      </section>

      <section className="marquee" aria-label="Practice features">
        <div className="marquee-track">
          {['Voice recording', 'AI transcript', 'Score breakdown', 'Better answer', 'Practice history', 'Interview rhythm', 'Voice recording', 'AI transcript'].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / Practice flow</span>
            <h2>Train the way interviews actually happen.</h2>
          </div>
          <p>
            The app keeps the loop simple: choose a question, speak your answer,
            then use the review to make the next attempt more precise.
          </p>
        </div>
        <div className="steps-row">
          {steps.map((s) => (
            <div key={s.step} className="step-item">
              <div className="step-num">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section categories-section">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">02 / Question banks</span>
            <h2>Pick your next round.</h2>
          </div>
        </div>
        <div className="cat-grid">
          {categories.map((c, index) => (
            <Link key={c.id} href={`/interview?category=${c.id}`} className="cat-card">
              <span className="cat-index">0{index + 1}</span>
              <div className="cat-icon">{c.icon}</div>
              <h3 className="cat-title">{c.label}</h3>
              <p className="cat-desc">{c.desc}</p>
              <div className="cat-footer">{c.count} questions</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
