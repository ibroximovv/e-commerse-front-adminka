import {
  Search,
  Package,
  Tags,
  ShoppingCart,
  Users as UsersIcon,
  LayoutDashboard,
  User as UserIcon,
  ArrowRight,
  X,
  CornerDownLeft,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '@/features/categories/hooks'
import { useOrders } from '@/features/orders/hooks'
import { useProducts } from '@/features/products/hooks'
import { useUsers } from '@/features/users/hooks'
import { fileUrl } from '@/lib/api'
import { formatPrice, shortId } from '@/lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

/*
 * Yopiq holatda umuman mount qilinmaydi — qidiruv matni va tanlangan qator
 * o'z-o'zidan tozalanadi va yopiq paytda hech qanday so'rov ketmaydi.
 */
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  if (!isOpen) return null
  return <CommandPaletteDialog onClose={onClose} />
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Fetch quick search datasets
  const { data: productsData } = useProducts({ limit: 50, includeArchived: true })
  const { data: categoriesData } = useCategories({ include_archived: true })
  const { data: ordersData } = useOrders()
  const { data: usersData } = useUsers()

  const products = productsData?.items ?? []
  const categories = categoriesData?.items ?? []
  const orders = ordersData?.items ?? []
  const users = usersData?.items ?? []

  // Navigation pages list
  const pages = useMemo(
    () => [
      { id: 'dash', title: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
      { id: 'prod', title: t('nav.products'), path: '/products', icon: Package },
      { id: 'cat', title: t('nav.categories'), path: '/categories', icon: Tags },
      { id: 'ord', title: t('nav.orders'), path: '/orders', icon: ShoppingCart },
      { id: 'usr', title: t('nav.users'), path: '/users', icon: UsersIcon },
      { id: 'prof', title: t('nav.profile'), path: '/profile', icon: UserIcon },
    ],
    [t],
  )

  // Search filter matches
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result: Array<{
      id: string
      type: 'page' | 'product' | 'category' | 'order' | 'user'
      title: string
      subtitle?: string
      badge?: string
      image?: string
      icon?: React.ComponentType<{ className?: string }>
      onSelect: () => void
    }> = []

    // Pages match
    pages.forEach((p) => {
      if (!q || p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)) {
        result.push({
          id: `page-${p.id}`,
          type: 'page',
          title: p.title,
          subtitle: p.path,
          icon: p.icon,
          onSelect: () => {
            navigate(p.path)
            onClose()
          },
        })
      }
    })

    if (!q) return result.slice(0, 8)

    // Products match
    products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .forEach((p) => {
        result.push({
          id: `prod-${p.id}`,
          type: 'product',
          title: p.name,
          subtitle: `${p.brand ? p.brand + ' · ' : ''}${formatPrice(p.final_price ?? p.price)}`,
          badge: p.stock <= 0 ? t('product.outOfStock') : `${p.stock} in stock`,
          image: p.images?.[0] ? fileUrl(p.images[0]) : undefined,
          icon: Package,
          onSelect: () => {
            navigate('/products')
            onClose()
          },
        })
      })

    // Categories match
    categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((c) => {
        result.push({
          id: `cat-${c.id}`,
          type: 'category',
          title: c.name,
          subtitle: `/${c.slug}`,
          badge: `${c.product_count ?? 0} ${t('search.products')}`,
          image: c.image ? fileUrl(c.image) : undefined,
          icon: Tags,
          onSelect: () => {
            navigate('/categories')
            onClose()
          },
        })
      })

    // Orders match
    orders
      .filter((o) => {
        const idMatch = o.id.toLowerCase().includes(q)
        const userMatch =
          o.user?.full_name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.user?.phone?.toLowerCase().includes(q)
        return idMatch || userMatch
      })
      .slice(0, 4)
      .forEach((o) => {
        result.push({
          id: `order-${o.id}`,
          type: 'order',
          title: `${shortId(o.id)} · ${formatPrice(o.total_amount)}`,
          subtitle: o.user?.full_name || o.user?.email || 'Guest',
          badge: t(`order.status.${o.status}`),
          icon: ShoppingCart,
          onSelect: () => {
            navigate(`/orders/${o.id}`)
            onClose()
          },
        })
      })

    // Users match
    users
      .filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .forEach((u) => {
        result.push({
          id: `user-${u.id}`,
          type: 'user',
          title: u.full_name || u.email,
          subtitle: u.email,
          badge: u.role,
          image: u.photo ? fileUrl(u.photo) : undefined,
          icon: UsersIcon,
          onSelect: () => {
            navigate(`/users?search=${encodeURIComponent(u.email)}`)
            onClose()
          },
        })
      })

    return result
  }, [query, pages, products, categories, orders, users, navigate, onClose, t])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (items[selectedIndex]) {
          items[selectedIndex].onSelect()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Spotlight Dialog Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all">
        {/* Search Header */}
        <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={t('search.placeholder')}
            className="h-6 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              {t('search.noResults')}
            </div>
          ) : (
            <div className="space-y-0.5">
              {items.map((item, idx) => {
                const isSelected = idx === selectedIndex
                const Icon = item.icon

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onSelect}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border ${
                        isSelected
                          ? 'border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="size-full object-cover" />
                      ) : Icon ? (
                        <Icon className="size-3.5" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-medium">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-medium ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          className={`truncate text-[10px] ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                      {isSelected ? (
                        <CornerDownLeft className="size-3.5 text-primary-foreground" />
                      ) : (
                        <ArrowRight className="size-3.5 text-muted-foreground opacity-40" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 text-[9px] font-mono">
                ↑↓
              </kbd>
              <span className="hidden sm:inline">Navigatsiya</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 text-[9px] font-mono">
                ↵
              </kbd>
              <span className="hidden sm:inline">Tanlash</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)
              onClose()
            }}
            className="text-xs font-medium text-brand hover:underline"
          >
            {t('search.allResults')}
          </button>
        </div>
      </div>
    </div>
  )
}
