import { Sheet, SheetContent, SheetTitle } from 'dgz-ui/sheet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { CommandPalette } from './CommandPalette'
import { Header } from './Header'
import { Sidebar, SidebarBrand, SidebarNav } from './Sidebar'
import { useProfile } from '@/features/auth/hooks'

const COLLAPSE_KEY = 'sidebar_collapsed'

export function AdminLayout() {
  const { t } = useTranslation()
  const { data: user } = useProfile()

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === '1',
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1')
      return !prev
    })
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        collapsed={collapsed}
        onOpenCommand={() => setCommandOpen(true)}
      />

      {/* Mobil navigatsiya */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 gap-0 border-r border-border bg-background-secondary p-0"
        >
          <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
          <SidebarBrand />
          <SidebarNav
            onNavigate={() => setMobileOpen(false)}
            onOpenCommand={() => {
              setMobileOpen(false)
              setCommandOpen(true)
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Universal Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  )
}

