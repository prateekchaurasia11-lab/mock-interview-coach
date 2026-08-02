import Link from 'next/link'

const categories = [
  {
    id: 'hr',
    label: 'HR & Behavioural',
    icon: '🤝',
    desc: 'Tell me about yourself, strengths, weaknesses, situational questions.',
    count: 5,
  },
  {
    id: 'technical',
    label: 'Technical Concepts',
    icon: '⚙️',
    desc: 'System design, databases, APIs, web fundamentals.',
    count: 5,
  },
  {
    id: 'dsa',
    label: 'DSA & Algorithms',
    icon: '🧠',
    desc: 'Data structures, sorting, complexity, problem-solving approach.',
    count: 5,
  },
]

export default function HomePage() {
  return (
    <main className="home-main">
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">AI-Powered · Instant Feedback · Free</div>
        <h1 className="hero-title">
          Practice interviews.<br />
          <span className="hero-accent">Get smarter feedback.</span>
        </h1>
        <p className="hero-sub">
          Record your answer, get a transcript, and receive detailed AI feedback
          on communication, content quality, and confidence — in under 30 seconds.
        </p>
        <div className="hero-actions">
          <Link href="/interview" className="btn-primary">
            Start Practising →
          </Link>
          <Link href="/history" className="btn-ghost">
            View History
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <h2 className="section-heading">How it works</h2>
        <div className="steps-row">
          {[
            { step: '01', title: 'Pick a question', desc: 'Choose from HR, Technical, or DSA categories.' },
            { step: '02', title: 'Record your answer', desc: 'Speak naturally. Up to 2 minutes per answer.' },
            { step: '03', title: 'Get AI feedback', desc: 'Whisper transcribes, GPT grades with scores and tips.' },
          ].map((s) => (
            <div key={s.step} className="step-item">
              <div className="step-num">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2 className="section-heading">Choose a category</h2>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c.id} href={`/interview?category=${c.id}`} className="cat-card">
              <div className="cat-icon">{c.icon}</div>
              <h3 className="cat-title">{c.label}</h3>
              <p className="cat-desc">{c.desc}</p>
              <div className="cat-footer">{c.count} questions →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
