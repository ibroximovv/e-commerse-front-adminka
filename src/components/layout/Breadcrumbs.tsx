import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './nav-items'
import { shortId } from '@/lib/utils'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const items: Array<{ label: string; to: string }> = [
    { label: t('nav.dashboard'), to: '/' },
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Match known nav items
    const matchedNav = NAV_ITEMS.find((item) => item.to === currentPath)
    if (matchedNav) {
      items.push({ label: t(matchedNav.labelKey), to: currentPath })
    } else if (pathname.startsWith('/profile')) {
      items.push({ label: t('nav.profile'), to: '/profile' })
    } else if (pathname.startsWith('/search')) {
      items.push({ label: t('search.title'), to: '/search' })
    } else if (isLast && segments[index - 1] === 'orders') {
      // Order ID
      items.push({ label: `#${shortId(segment)}`, to: currentPath })
    } else {
      items.push({ label: segment, to: currentPath })
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        title={t('nav.dashboard')}
      >
        <Home className="size-3.5" />
      </Link>

      {items.slice(1).map((item, idx) => {
        const isLast = idx === items.slice(1).length - 1

        return (
          <div key={item.to} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-foreground transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
