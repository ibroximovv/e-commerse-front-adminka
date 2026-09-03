import { Store, Search, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './nav-items'
import { useLogout, useProfile } from '@/features/auth/hooks'
import { fileUrl } from '@/lib/api'
import { cn, initials } from '@/lib/utils'

export function SidebarNav({
  collapsed = false,
  onNavigate,
  onOpenCommand,
}: {
  collapsed?: boolean
  onNavigate?: () => void
  onOpenCommand?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: user } = useProfile()
  const logout = useLogout()

  return (
    <div className="flex flex-1 flex-col justify-between p-3">
      <nav className="flex flex-col gap-1" aria-label={t('nav.menu')}>
        {/* Quick Search / Command Palette trigger */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            if (onOpenCommand) {
              onOpenCommand()
            } else {
              navigate('/search')
            }
          }}
          title={collapsed ? `${t('nav.search')} (⌘K)` : undefined}
          className={cn(
            'mb-2 flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground',
            collapsed && 'justify-center px-2',
          )}
        >
          <Search className="size-3.5 shrink-0" aria-hidden />
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <span className="truncate">{t('nav.search')}</span>
              <kbd className="shrink-0 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] font-mono">
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                    )}
                    aria-hidden
                  />
                  {!collapsed && (
                    <span className="truncate">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Quick Box / Logout at bottom of sidebar */}
      {!collapsed ? (
        <div className="mt-4 rounded-xl border border-border bg-card p-2.5">
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => {
                onNavigate?.()
                navigate('/profile')
              }}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-xs font-semibold text-foreground hover:ring-1 hover:ring-ring"
            >
              {user?.photo ? (
                <img src={fileUrl(user.photo)} alt="" className="size-full object-cover" />
              ) : (
                initials(user?.full_name, user?.email)
              )}
            </div>

            <div
              onClick={() => {
                onNavigate?.()
                navigate('/profile')
              }}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <p className="truncate text-xs font-medium text-foreground hover:text-brand">
                {user?.full_name || t('role.ADMIN')}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.role || 'ADMIN'}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              title={t('nav.logout')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              navigate('/profile')
            }}
            title={t('nav.profile')}
            className="flex size-8 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-xs font-semibold text-foreground hover:ring-1 hover:ring-ring"
          >
            {user?.photo ? (
              <img src={fileUrl(user.photo)} alt="" className="size-full object-cover" />
            ) : (
              initials(user?.full_name, user?.email)
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2.5 border-b border-border bg-card px-4',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
        <Store className="size-4" aria-hidden />
      </span>

      {!collapsed && (
        <div className="flex flex-col truncate">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {t('common.appName')}
          </span>
        </div>
      )}
    </div>
  )
}

/** Desktop sidebar. Mobilda AdminLayout ichida Sheet ishlatiladi. */
export function Sidebar({
  collapsed,
  onOpenCommand,
}: {
  collapsed: boolean
  onOpenCommand?: () => void
}) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r border-border bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} onOpenCommand={onOpenCommand} />
    </aside>
  )
}
