import type { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  coachName?: string
  onLogout?: () => void
}

export function Layout({ children, coachName, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-woohwa-cream font-sans">
      <Header coachName={coachName} onLogout={onLogout} />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
