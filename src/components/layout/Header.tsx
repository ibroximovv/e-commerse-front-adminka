import { Button } from 'dgz-ui/button'
import { ThemeToggle } from 'dgz-ui-shared/components/theme'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
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
  const updateProfile = useUpdateProfile()

  const handleLanguage = (language: Language) => {
    setLanguage(language)
    // Tanlov hisobga ham yozilsin; muvaffaqiyatsiz bo'lsa interfeys baribir
    // almashgan bo'ladi, shuning uchun xatoni ko'rsatib bezovta qilmaymiz.
    updateProfile.mutate({ language })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <Button
        variant="tertiary"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label={t('nav.menu')}
      >
        <Menu className="size-[1.2rem]" aria-hidden />
      </Button>

      <Button
        variant="tertiary"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-[1.2rem]" aria-hidden />
        ) : (
          <PanelLeftClose className="size-[1.2rem]" aria-hidden />
        )}
      </Button>

      <h2 className="ml-1 truncate text-sm font-medium text-foreground">{title}</h2>

      <div className="ml-auto flex items-center gap-1">
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
