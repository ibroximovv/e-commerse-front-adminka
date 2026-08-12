import { Sheet, SheetContent, SheetTitle } from 'dgz-ui/sheet'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
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

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1')
      return !prev
    })
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar collapsed={collapsed} />

      {/* Mobil navigatsiya */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {/*
          `SheetContent` da fon klassi umuman yo'q (kutubxonada shunday) —
          bermasak panel shaffof bo'lib, orqadagi kontent ko'rinib turadi.
          Desktop sidebar bilan bir xil sirtni beramiz.
        */}
        <SheetContent
          side="left"
          className="w-64 gap-0 border-r border-border bg-background-secondary p-0"
        >
          <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
          <SidebarBrand />
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
