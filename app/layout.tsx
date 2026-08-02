import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Mock Interview Coach',
  description: 'Practice interviews and get instant AI feedback on your answers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="nav-brand">InterviewAI</Link>
          <div className="nav-links">
            <Link href="/interview" className="nav-link">Practice</Link>
            <Link href="/history" className="nav-link">History</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
