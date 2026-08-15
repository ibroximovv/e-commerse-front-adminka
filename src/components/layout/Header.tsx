import { Button } from 'dgz-ui/button'
import { ThemeToggle } from 'dgz-ui-shared/components/theme'
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NAV_ITEMS } from './nav-items'
import { UserMenu } from './UserMenu'
import { setLanguage, storedLanguage } from '@/i18n'
import { useUpdateProfile } from '@/features/profile/hooks'
import type { Language, User } from '@/lib/types'

function useCurrentTitle() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  if (pathname.startsWith('/profile')) return t('nav.profile')
  if (pathname.startsWith('/search')) return t('search.title')

  const match = NAV_ITEMS.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )
  return match ? t(match.labelKey) : t('common.appName')
}

export function Header({
  user,
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}: {
  user?: User
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobileNav: () => void
}) {
  const { t } = useTranslation()
  const title = useCurrentTitle()
  const navigate = useNavigate()
  const updateProfile = useUpdateProfile()

  const handleLanguage = (language: Language) => {
    setLanguage(language)
    updateProfile.mutate({ language })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-card/60 px-4 backdrop-blur-xl">
      <Button
        variant="tertiary"
        size="icon"
        className="rounded-xl lg:hidden"
        onClick={onOpenMobileNav}
        aria-label={t('nav.menu')}
      >
        <Menu className="size-[1.2rem]" aria-hidden />
      </Button>

      <Button
        variant="tertiary"
        size="icon"
        className="hidden rounded-xl lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-[1.2rem]" aria-hidden />
        ) : (
          <PanelLeftClose className="size-[1.2rem]" aria-hidden />
        )}
      </Button>

      <h2 className="ml-1 truncate text-sm font-semibold tracking-tight text-foreground">{title}</h2>

      {/* Header Quick Search Button */}
      <button
        type="button"
        onClick={() => navigate('/search')}
        className="ml-4 hidden max-w-[200px] xl:max-w-xs flex-1 items-center gap-2 rounded-xl border border-border/40 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground md:flex"
      >
        <Search className="size-3.5 shrink-0 text-brand" />
        <span className="truncate">{t('nav.search')}...</span>
        <kbd className="ml-auto hidden rounded border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[10px] font-mono xl:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <LanguageSwitcher
          value={user?.language ?? storedLanguage()}
          onSelect={handleLanguage}
        />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
