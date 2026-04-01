import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../common/Button'
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons'
import { cn } from '../../utils/cn'
import type { AuthMe } from '../../types/api'

const mobileNavigation = [
  { name: 'Tableau de bord', href: '/app/dashboard' },
  { name: 'Clients', href: '/app/clients' },
  { name: 'Segments', href: '/app/segments' },
  { name: 'Campagnes', href: '/app/campaigns' },
  { name: 'Produits', href: '/app/products' },
  { name: 'Ventes', href: '/app/sales' },
  { name: 'Analytics', href: '/app/analytics' },
  { name: 'Parametres', href: '/app/settings' },
]

interface HeaderProps {
  currentUser?: AuthMe | null
}

export function Header({ currentUser }: HeaderProps) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const fullName = `${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim()
  const userName = fullName || currentUser?.username || 'Utilisateur'
  const userRole = currentUser?.role ?? 'Membre'

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-violet-100/70 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b13]/70">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src="../logo.png" className='h-12 min-lg:hidden' alt="" />
          {/* <div className="relative w-full max-w-xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher clients, segments, campagnes..."
              className="h-10 border-violet-100/80 bg-white/90 pl-10 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-black/40"
            />
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl border border-violet-100/80 bg-white/80 text-slate-700 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <Cross2Icon className="h-5 w-5" /> : <HamburgerMenuIcon className="h-5 w-5" />}
          </Button>
          {/* <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
          </Button> */}
          {/* <Button className="hidden gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 sm:inline-flex">
            <PlusIcon className="h-4 w-4" />
            Nouvelle campagne
          </Button> */}
          <div className="hidden items-center gap-2 rounded-xl border border-violet-100/80 bg-white/80 px-2 py-1.5 lg:flex dark:border-white/10 dark:bg-white/5">
            <img src="../avatar.png" alt="profil" className="h-7 w-7 rounded-full object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-violet-100/70 px-4 py-4 dark:border-white/10 lg:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-violet-100/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
            <img src="../avatar.png" alt="profil" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
            </div>
          </div>
          <nav className="grid gap-2">
          {mobileNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20'
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
          </nav>
        </div>
      )}
    </header>
  )
}
