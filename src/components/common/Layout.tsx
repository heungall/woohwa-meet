import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  coachName?: string
  onLogout?: () => void
}

export function Layout({ children, coachName, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-woohwa-cream font-sans flex flex-col">
      <Header coachName={coachName} onLogout={onLogout} />
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1">{children}</main>
      <Footer />
    </div>
  )
}
