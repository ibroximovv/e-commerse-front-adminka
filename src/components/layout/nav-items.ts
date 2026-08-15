import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Search,
  Tags,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/products', labelKey: 'nav.products', icon: Package },
  { to: '/categories', labelKey: 'nav.categories', icon: Tags },
  { to: '/orders', labelKey: 'nav.orders', icon: ShoppingCart },
  { to: '/users', labelKey: 'nav.users', icon: Users },
  { to: '/search', labelKey: 'nav.search', icon: Search },
]
