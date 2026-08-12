import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  /** Marshrut hali qurilmagan — sidebar'da ko'rinadi, lekin bosilmaydi. */
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/products', labelKey: 'nav.products', icon: Package, disabled: true },
  { to: '/categories', labelKey: 'nav.categories', icon: Tags, disabled: true },
  { to: '/orders', labelKey: 'nav.orders', icon: ShoppingCart, disabled: true },
  { to: '/users', labelKey: 'nav.users', icon: Users, disabled: true },
]
