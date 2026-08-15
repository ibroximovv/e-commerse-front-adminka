import { Button } from 'dgz-ui/button'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import {
  Package,
  Search,
  ShoppingCart,
  Tags,
  Users as UsersIcon,
  X,
  ArrowRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/States'
import { OrderStatusBadge } from '@/components/ui/StatusBadge'
import { useCategories } from '@/features/categories/hooks'
import { useOrders } from '@/features/orders/hooks'
import { useProducts } from '@/features/products/hooks'
import { useUsers } from '@/features/users/hooks'
import { fileUrl } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

type SearchEntityType = 'all' | 'products' | 'categories' | 'orders' | 'users'

export function GlobalSearchPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('search.title'))

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTab, setActiveTab] = useState<SearchEntityType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')

  // Auto-focus search input & bind Ctrl+K / Cmd+K
  useEffect(() => {
    searchInputRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Synchronize search params
  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (val) {
      setSearchParams({ q: val })
    } else {
      setSearchParams({})
    }
  }

  // Fetch data sources
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    includeArchived: true,
    limit: 100,
  })
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({
    include_archived: true,
  })
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders()
  const { data: usersData, isLoading: isUsersLoading } = useUsers()

  const products = productsData?.items ?? []
  const categories = categoriesData?.items ?? []
  const orders = ordersData?.items ?? []
  const users = usersData?.items ?? []

  const isLoading =
    isProductsLoading || isCategoriesLoading || isOrdersLoading || isUsersLoading

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && p.category_id !== selectedCategory) return false

      // Stock status filter
      if (stockFilter === 'in_stock' && p.stock <= 0) return false
      if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock > 5)) return false
      if (stockFilter === 'out_of_stock' && p.stock > 0) return false

      // Price filter
      const price = p.final_price ?? p.price
      if (minPrice && price < Number(minPrice)) return false
      if (maxPrice && price > Number(maxPrice)) return false

      // Text query
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    })
  }, [products, query, selectedCategory, stockFilter, minPrice, maxPrice])

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories.filter((c) => {
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    })
  }, [categories, query])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (!q) return true
      const idMatch = o.id.toLowerCase().includes(q)
      const userMatch =
        o.user?.full_name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.user?.phone?.toLowerCase().includes(q)
      const itemMatch = o.items.some((i) =>
        i.product?.name?.toLowerCase().includes(q),
      )
      return idMatch || userMatch || itemMatch
    })
  }, [orders, query])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (!q) return true
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      )
    })
  }, [users, query])

  const totalMatchCount =
    filteredProducts.length +
    filteredCategories.length +
    filteredOrders.length +
    filteredUsers.length

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('search.title')}
        description={t('search.subtitle')}
      />

      {/* Main Search Input & Bar */}
      <div className="relative rounded-2xl border border-border/40 bg-card/80 p-2 shadow-md backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3">
          <Search className="size-5 shrink-0 text-brand" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-11 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <div className="hidden items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2 py-1 text-xs font-mono font-medium text-muted-foreground sm:flex">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Entity Tabs & Filters Row */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Entity Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/40 bg-background/60 p-1 text-xs backdrop-blur-sm">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              label={t('search.allResults')}
              count={totalMatchCount}
            />
            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              label={t('search.products')}
              count={filteredProducts.length}
              icon={Package}
            />
            <TabButton
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
              label={t('search.categories')}
              count={filteredCategories.length}
              icon={Tags}
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              label={t('search.orders')}
              count={filteredOrders.length}
              icon={ShoppingCart}
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              label={t('search.users')}
              count={filteredUsers.length}
              icon={UsersIcon}
            />
          </div>

          {/* Reset Filters button */}
          {(selectedCategory || stockFilter !== 'all' || minPrice || maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => {
                setSelectedCategory('')
                setStockFilter('all')
                setMinPrice('')
                setMaxPrice('')
              }}
            >
              {t('common.reset')}
            </Button>
          )}
        </div>

        {/* Product Facet Filters (Only visible when Products or All active) */}
        {(activeTab === 'all' || activeTab === 'products') && (
          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-border/30 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="size-3" /> {t('search.filterCategory')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground shadow-2xs focus:outline-none"
              >
                <option value="">{t('common.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Availability Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <SlidersHorizontal className="size-3" /> {t('search.filterStockStatus')}
              </label>
              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(
                    e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock',
                  )
                }
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground shadow-2xs focus:outline-none"
              >
                <option value="all">{t('common.all')}</option>
                <option value="in_stock">{t('dashboard.inStockProducts')}</option>
                <option value="low_stock">{t('dashboard.lowStockProducts')}</option>
                <option value="out_of_stock">{t('dashboard.outOfStockProducts')}</option>
              </select>
            </div>

            {/* Min Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                {t('product.minPrice')}
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground shadow-2xs focus:outline-none"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                {t('product.maxPrice')}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10 000 000"
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground shadow-2xs focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Content */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : totalMatchCount === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card p-12 text-center shadow-xs">
          <EmptyState
            icon={<Search className="size-10 text-muted-foreground" />}
            title={t('search.noResults')}
            description={t('search.noResultsHint')}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* PRODUCTS SECTION */}
          {(activeTab === 'all' || activeTab === 'products') &&
            filteredProducts.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                    <Package className="size-4 text-brand" />
                    {t('search.products')} ({filteredProducts.length})
                  </h3>
                  {activeTab === 'all' && filteredProducts.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-brand"
                    >
                      {t('dashboard.viewAll')} <ArrowRight className="size-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredProducts.slice(0, 6)
                    : filteredProducts
                  ).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate('/products')}
                      className="group flex cursor-pointer items-center gap-3.5 rounded-xl border border-border/40 bg-card/80 p-3 shadow-xs transition-all duration-200 hover:bg-accent/40 hover:shadow-md"
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/30">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={fileUrl(product.images[0])}
                            alt={product.name}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <Package className="size-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-brand">
                          {product.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          {product.brand && <span>{product.brand}</span>}
                          {product.category?.name && (
                            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {formatPrice(product.final_price ?? product.price)}
                          </span>
                          {product.stock <= 0 ? (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
                              {t('product.outOfStock')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {product.stock} {t('product.inStock')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* CATEGORIES SECTION */}
          {(activeTab === 'all' || activeTab === 'categories') &&
            filteredCategories.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                    <Tags className="size-4 text-brand" />
                    {t('search.categories')} ({filteredCategories.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredCategories.slice(0, 6)
                    : filteredCategories
                  ).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => navigate('/categories')}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 shadow-xs transition-all duration-200 hover:bg-accent/40 hover:shadow-md"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-brand/10 text-brand">
                        {category.image ? (
                          <img
                            src={fileUrl(category.image)}
                            alt={category.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Tags className="size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-brand">
                          {category.name}
                        </h4>
                        <p className="font-mono text-xs text-muted-foreground">
                          /{category.slug}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {category.product_count ?? 0} {t('search.products')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ORDERS SECTION */}
          {(activeTab === 'all' || activeTab === 'orders') &&
            filteredOrders.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                    <ShoppingCart className="size-4 text-brand" />
                    {t('search.orders')} ({filteredOrders.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(activeTab === 'all'
                    ? filteredOrders.slice(0, 4)
                    : filteredOrders
                  ).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/80 p-3.5 shadow-xs transition-all duration-200 hover:bg-accent/40 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground group-hover:text-brand">
                            #{order.id.slice(0, 8)}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.user?.full_name || order.user?.email || 'Guest'} ·{' '}
                          {order.items.length} {t('order.itemsShort')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* USERS SECTION */}
          {(activeTab === 'all' || activeTab === 'users') &&
            filteredUsers.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                    <UsersIcon className="size-4 text-brand" />
                    {t('search.users')} ({filteredUsers.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredUsers.slice(0, 6)
                    : filteredUsers
                  ).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate('/users')}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/40 bg-card/80 p-3 shadow-xs transition-all duration-200 hover:bg-accent/40 hover:shadow-md"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10 font-bold text-brand">
                        {user.photo ? (
                          <img
                            src={fileUrl(user.photo)}
                            alt={user.full_name || user.email}
                            className="size-full object-cover"
                          />
                        ) : (
                          (user.full_name || user.email)[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-brand">
                          {user.full_name || t('user.noName')}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all ${
        active
          ? 'bg-brand text-brand-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {Icon && <Icon className="size-3.5" />}
      {label} ({count})
    </button>
  )
}
