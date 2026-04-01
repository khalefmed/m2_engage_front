import { NavLink } from 'react-router-dom'
import {
  DashboardIcon,
  PersonIcon,
  RocketIcon,
  BarChartIcon,
  GearIcon,
  ExitIcon,
  CubeIcon,
} from '@radix-ui/react-icons'
import { cn } from '../../utils/cn'
import { Button } from '../common/Button'
import type { AuthMe } from '../../types/api'

const navigation = [
  { name: 'Tableau de bord', href: '/app/dashboard', icon: DashboardIcon },
  { name: 'Clients', href: '/app/clients', icon: PersonIcon },
  { name: 'Segments', href: '/app/segments', icon: PersonIcon },
  { name: 'Campagnes', href: '/app/campaigns', icon: RocketIcon },
  { name: 'Produits', href: '/app/products', icon: CubeIcon },
  { name: 'Ventes', href: '/app/sales', icon: BarChartIcon },
  { name: 'Analytics', href: '/app/analytics', icon: BarChartIcon },
  { name: 'Parametres', href: '/app/settings', icon: GearIcon },
]

interface SidebarProps {
  onLogout?: () => void
  currentUser?: AuthMe | null
}

export function Sidebar({ onLogout, currentUser }: SidebarProps) {
  const fullName = `${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim()
  const userName = fullName || currentUser?.username || 'Utilisateur'
  const userRole = currentUser?.role ?? 'Membre'

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-violet-100/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0b13]/85 lg:flex">
      <div className="flex h-full w-full flex-col">
        <div className="flex py-4 items-center justify-between border-b border-violet-100/80 px-6 dark:border-white/10">
    
          <img src="../logo.png" className='h-16'  alt="" />
        </div>
        <br />

        {/* <div className="px-4 py-5">
          <Button className="w-full justify-between rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500">
            Ajouter campagne
            <span className="text-xl leading-none">+</span>
          </Button>
        </div> */}

        <nav className="flex-1 space-y-1 px-3 pb-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-violet-500 dark:text-violet-300')} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-violet-100/80 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-violet-50/70 p-3 dark:bg-white/5">
            <img
              src="../avatar.png"
              alt="profil"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userRole}</p>
            </div>
          </div>
          <Button type="button" onClick={onLogout} variant="secondary" className="w-full justify-start gap-2">
            <ExitIcon className="h-4 w-4" />
            Deconnexion
          </Button>
        </div>
      </div>
    </aside>
  )
}
