import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { RotateCcw, Search, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getOrderColumns } from '../components/columns'
import { filterOrders, sortByNewest } from '../filters'
import { useOrders } from '../hooks'
import { DEFAULT_ORDER_FILTERS } from '../types'
import type { OrderFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { paginateLocal } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUSES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function OrdersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('order.title'))

  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useOrders()

  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const orders = data?.items
  const allOrders = useMemo(() => sortByNewest(orders ?? []), [orders])

  const filtered = useMemo(
    () => filterOrders(allOrders, filters),
    [allOrders, filters],
  )

  const countByStatus = useMemo(() => {
    const counts = Object.fromEntries(
      ORDER_STATUSES.map((status) => [status, 0]),
    ) as Record<OrderStatus, number>

    for (const order of allOrders) counts[order.status] += 1
    return counts
  }, [allOrders])

  const columns = useMemo(
    () => getOrderColumns({ onView: (order: Order) => navigate(`/orders/${order.id}`), t }),
    [navigate, t],
  )

  const setFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const isFiltered =
    filters.search !== '' ||
    filters.status !== 'ALL' ||
    filters.from !== '' ||
    filters.to !== ''

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('order.title')} description={t('order.subtitle')} />
        <TableSkeleton rows={6} columns={7} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('order.title')}
        description={t('order.subtitle')}
        actions={
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('order.totalCount', { value: allOrders.length })}
          </span>
        }
      />

      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-xs">
        {/* Status tabs — mobilda gorizontal scroll, sahifaning o'zi emas */}
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div
            role="tablist"
            aria-label={t('order.orderStatus')}
            className="flex w-max items-center gap-1 rounded-lg border border-border bg-background p-1 text-xs"
          >
            <StatusTab
              active={filters.status === 'ALL'}
              onClick={() => setFilter('status', 'ALL')}
              label={t('common.all')}
              count={allOrders.length}
            />

            {ORDER_STATUSES.map((status) => (
              <StatusTab
                key={status}
                active={filters.status === status}
                onClick={() => setFilter('status', status)}
                label={t(`order.status.${status}`)}
                count={countByStatus[status]}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder={t('order.searchPlaceholder')}
              aria-label={t('order.searchPlaceholder')}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <DateField
              label={t('order.dateFrom')}
              value={filters.from}
              max={filters.to || undefined}
              onChange={(value) => setFilter('from', value)}
            />
            <DateField
              label={t('order.dateTo')}
              value={filters.to}
              min={filters.from || undefined}
              onChange={(value) => setFilter('to', value)}
            />

            {isFiltered ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilters(DEFAULT_ORDER_FILTERS)
                  setPage(1)
                }}
              >
                <RotateCcw className="size-4" aria-hidden />
                {t('common.reset')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState
            icon={<ShoppingCart className="size-10 text-muted-foreground" />}
            title={isFiltered ? t('order.noMatches') : t('order.empty')}
            description={
              isFiltered ? t('order.noMatchesHint') : t('order.emptyHint')
            }
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilters(DEFAULT_ORDER_FILTERS)
                    setPage(1)
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  {t('common.reset')}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <DataTable<Order>
          tableKey="orders-table"
          rowKey="id"
          columns={columns}
          /* Backendda sahifalash yo'q — kesish mijoz tomonda. */
          dataSource={paginateLocal(filtered, page, limit)}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
          onParamChange={(params: Record<string, unknown>) => {
            if (typeof params.page === 'number' && params.page !== page) {
              setPage(params.page)
            }
            if (typeof params.limit === 'number' && params.limit !== limit) {
              setLimit(params.limit)
              setPage(1)
            }
          }}
          hasPagination
          hasColumnsVisibilityDropdown
        />
      )}
    </div>
  )
}

function StatusTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors',
        active
          ? 'bg-brand text-brand-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label} ({count})
    </button>
  )
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </label>
  )
}
