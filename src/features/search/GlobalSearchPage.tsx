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
  ExternalLink,
  Phone,
  Mail,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { controlClass, NativeSelect } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/States'
import { OrderStatusBadge, RoleBadge } from '@/components/ui/StatusBadge'
import { useCategories } from '@/features/categories/hooks'
import { useOrders } from '@/features/orders/hooks'
import { useProducts } from '@/features/products/hooks'
import { useUsers } from '@/features/users/hooks'
import { fileUrl } from '@/lib/api'
import { formatPrice, shortId } from '@/lib/utils'

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

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

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
      if (selectedCategory && p.category_id !== selectedCategory) return false

      if (stockFilter === 'in_stock' && p.stock <= 0) return false
      if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock > 5)) return false
      if (stockFilter === 'out_of_stock' && p.stock > 0) return false

      const price = p.final_price ?? p.price
      if (minPrice && price < Number(minPrice)) return false
      if (maxPrice && price > Number(maxPrice)) return false

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

  const quickSuggestions = [
    { label: 'TOP Mahsulotlar', action: () => handleQueryChange('top') },
    { label: 'Kutilayotgan Buyurtmalar', action: () => { setActiveTab('orders'); handleQueryChange(''); } },
    { label: 'Omborda kam', action: () => { setStockFilter('low_stock'); setActiveTab('products'); } },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('search.title')}
        description={t('search.subtitle')}
      />

      {/* Main Search Input & Bar */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2.5 px-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-8 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2 px-1 text-xs">
            <span className="text-muted-foreground">Takliflar:</span>
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={s.action}
                className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-foreground transition-colors hover:bg-muted"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entity Tabs & Filters Row */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Entity Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-0.5 text-xs">
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
              className="rounded-lg text-xs"
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

        {/* Product Facet Filters */}
        {(activeTab === 'all' || activeTab === 'products') && (
          <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-border/40 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="size-3" /> {t('search.filterCategory')}
              </label>
              <NativeSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">{t('common.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <SlidersHorizontal className="size-3" /> {t('search.filterStockStatus')}
              </label>
              <NativeSelect
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(
                    e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock',
                  )
                }
              >
                <option value="all">{t('common.all')}</option>
                <option value="in_stock">{t('dashboard.inStockProducts')}</option>
                <option value="low_stock">{t('dashboard.lowStockProducts')}</option>
                <option value="out_of_stock">{t('dashboard.outOfStockProducts')}</option>
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t('product.minPrice')}
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className={controlClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t('product.maxPrice')}
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10 000 000"
                className={controlClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Content */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : totalMatchCount === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            icon={<Search className="size-8 text-muted-foreground" />}
            title={t('search.noResults')}
            description={t('search.noResultsHint')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* PRODUCTS SECTION */}
          {(activeTab === 'all' || activeTab === 'products') &&
            filteredProducts.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Package className="size-3.5" />
                    {t('search.products')} ({filteredProducts.length})
                  </h3>
                  {activeTab === 'all' && filteredProducts.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-brand"
                    >
                      {t('dashboard.viewAll')} <ArrowRight className="size-3 ml-1" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredProducts.slice(0, 6)
                    : filteredProducts
                  ).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate('/products')}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={fileUrl(product.images[0])}
                            alt={product.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-semibold text-foreground">
                          {product.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          {product.brand && <span>{product.brand}</span>}
                          {product.category?.name && (
                            <span className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {formatPrice(product.final_price ?? product.price)}
                          </span>
                          {product.stock <= 0 ? (
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.2 text-[10px] text-rose-500">
                              {t('product.outOfStock')}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {product.stock} {t('product.inStock')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* CATEGORIES SECTION */}
          {(activeTab === 'all' || activeTab === 'categories') &&
            filteredCategories.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Tags className="size-3.5" />
                    {t('search.categories')} ({filteredCategories.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredCategories.slice(0, 6)
                    : filteredCategories
                  ).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => navigate('/categories')}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40 text-muted-foreground">
                        {category.image ? (
                          <img
                            src={fileUrl(category.image)}
                            alt={category.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Tags className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-semibold text-foreground">
                          {category.name}
                        </h4>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          /{category.slug}
                        </p>
                      </div>
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
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
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <ShoppingCart className="size-3.5" />
                    {t('search.orders')} ({filteredOrders.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {(activeTab === 'all'
                    ? filteredOrders.slice(0, 4)
                    : filteredOrders
                  ).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-muted/30"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            #{shortId(order.id)}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.user?.full_name || order.user?.email || 'Guest'} ·{' '}
                          {order.items.length} {t('order.itemsShort')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold tabular-nums text-foreground">
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
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <UsersIcon className="size-3.5" />
                    {t('search.users')} ({filteredUsers.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeTab === 'all'
                    ? filteredUsers.slice(0, 6)
                    : filteredUsers
                  ).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate('/users')}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted font-semibold text-xs text-foreground border border-border">
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="truncate text-xs font-semibold text-foreground">
                            {user.full_name || t('user.noName')}
                          </h4>
                          <RoleBadge role={user.role} />
                        </div>
                        <div className="mt-0.5 flex flex-col text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="size-3" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="size-3" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
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
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 font-medium transition-colors ${
        active
          ? 'bg-muted text-foreground font-semibold'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {Icon && <Icon className="size-3" />}
      {label} ({count})
    </button>
  )
}
