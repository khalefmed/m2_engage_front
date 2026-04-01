import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { AuthMe } from '../../types/api'

interface MainLayoutProps {
  children: ReactNode
  onLogout?: () => void
  currentUser?: AuthMe | null
}

export function MainLayout({ children, onLogout, currentUser }: MainLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <Sidebar onLogout={onLogout} currentUser={currentUser} />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col lg:pl-72">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
        <Header currentUser={currentUser} />
        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
