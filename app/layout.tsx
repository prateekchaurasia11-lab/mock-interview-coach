import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Interview Coach',
  description: 'Practice interviews and get focused feedback on your spoken answers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      {/* Grammarly adds body attributes before hydration; only suppress this level. */}
      <body suppressHydrationWarning>
        <nav className="navbar">
          <Link href="/" className="nav-brand">Interview Coach</Link>
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
