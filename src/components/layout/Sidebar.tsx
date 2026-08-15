import { Store, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <nav className="flex flex-1 flex-col gap-1.5 px-3 py-4" aria-label={t('nav.menu')}>
      {/* Quick Search Button in Sidebar */}
      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          navigate('/search')
        }}
        title={collapsed ? t('search.title') : undefined}
        className={cn(
          'mb-2 flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs transition-all hover:bg-accent hover:text-foreground',
          collapsed && 'justify-center px-2',
        )}
      >
        <Search className="size-4 shrink-0 text-brand" aria-hidden />
        {!collapsed && (
          <div className="flex flex-1 items-center justify-between min-w-0">
            <span className="truncate">{t('nav.search')}</span>
            <kbd className="shrink-0 rounded border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </div>
        )}
      </button>

      {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => {
        const label = t(labelKey)

        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-brand text-brand-foreground shadow-sm shadow-brand/25 font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )
            }
          >
            <Icon className="size-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110" aria-hidden />
            {!collapsed && <span className="truncate tracking-tight">{label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/30 bg-card/40 px-4 backdrop-blur-md',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
        <Store className="size-[18px]" aria-hidden />
      </span>
      {!collapsed && (
        <div className="flex flex-col truncate">
          <span className="truncate text-sm font-bold tracking-tight text-foreground">
            {t('common.appName')}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </span>
        </div>
      )}
    </div>
  )
}

/** Desktop sidebar. Mobilda AdminLayout ichida Sheet ishlatiladi. */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-border/40 bg-card/40 backdrop-blur-xl transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}
