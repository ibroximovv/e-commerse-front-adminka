import { Badge } from 'dgz-ui/badge'
import { Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
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

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label={t('nav.menu')}>
      {NAV_ITEMS.map(({ to, labelKey, icon: Icon, disabled }) => {
        const label = t(labelKey)

        if (disabled) {
          return (
            <span
              key={to}
              aria-disabled
              title={collapsed ? `${label} — ${t('nav.comingSoon')}` : undefined}
              className={cn(
                'flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  <Badge variant="gray" size="sm" rounded="full">
                    {t('nav.comingSoon')}
                  </Badge>
                </>
              )}
            </span>
          )
        }

        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-brand-muted text-brand'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{label}</span>}
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
        'sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2.5 border-b border-border bg-background-secondary px-4',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        <Store className="size-[18px]" aria-hidden />
      </span>
      {!collapsed && (
        <span className="truncate text-sm font-semibold tracking-tight text-foreground">
          {t('common.appName')}
        </span>
      )}
    </div>
  )
}

/** Desktop sidebar. Mobilda AdminLayout ichida Sheet ishlatiladi. */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        // sticky + h-dvh: kontent uzun bo'lganda sidebar sahifa bilan
        // sirg'alib ketmaydi, o'z ichida scroll bo'ladi.
        'sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-border bg-background-secondary transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}
