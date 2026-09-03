import { Button } from 'dgz-ui/button'
import { ThemeToggle } from 'dgz-ui-shared/components/theme'
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Breadcrumbs } from './Breadcrumbs'
import { LanguageSwitcher } from './LanguageSwitcher'
import { UserMenu } from './UserMenu'
import { storedLanguage } from '@/i18n'
import { useChangeLanguage } from '@/i18n/useChangeLanguage'
import { useUpdateProfile } from '@/features/profile/hooks'
import type { Language, User } from '@/lib/types'

export function Header({
  user,
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
  onOpenCommand,
}: {
  user?: User
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobileNav: () => void
  onOpenCommand?: () => void
}) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const changeLanguage = useChangeLanguage()

  const handleLanguage = (language: Language) => {
    changeLanguage(language)
    updateProfile.mutate({ language })
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left section: toggler and breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          variant="tertiary"
          size="icon"
          className="rounded-lg lg:hidden"
          onClick={onOpenMobileNav}
          aria-label={t('nav.menu')}
        >
          <Menu className="size-[1.1rem]" aria-hidden />
        </Button>

        <Button
          variant="tertiary"
          size="icon"
          className="hidden rounded-lg lg:inline-flex"
          onClick={onToggleCollapse}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[1.1rem]" aria-hidden />
          ) : (
            <PanelLeftClose className="size-[1.1rem]" aria-hidden />
          )}
        </Button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right section: Quick search & controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search Button (Command Palette Trigger) */}
        <button
          type="button"
          onClick={onOpenCommand}
          className="flex h-8 w-36 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:w-52 md:w-64"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="truncate">{t('nav.search')}...</span>
          <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono sm:inline-block">
            ⌘K
          </kbd>
        </button>

        <div className="h-4 w-px bg-border" />

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
