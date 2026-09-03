import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { RotateCcw, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getOrderColumns } from '../components/columns'
import { filterOrders, sortByNewest } from '../filters'
import { useOrders } from '../hooks'
import { DEFAULT_ORDER_FILTERS } from '../types'
import type { OrderFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { controlClass, SearchInput } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { paginateLocal, toPagination } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUSES } from '@/lib/types'
import { cn } from '@/lib/utils'

export function OrdersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('order.title'))

  const navigate = useNavigate()
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_ORDER_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data, isLoading, isError, error, refetch } = useOrders({
    page,
    limit,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    search: filters.search.trim() || undefined,
    start_date: filters.from || undefined,
  })

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
      <div className="space-y-5">
        <PageHeader title={t('order.title')} description={t('order.subtitle')} />
        <TableSkeleton rows={6} columns={7} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('order.title')}
        description={t('order.subtitle')}
        actions={
          <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {t('order.totalCount', { value: allOrders.length })}
          </span>
        }
      />

      <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
        {/* Status tabs */}
        <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
          <Segmented<OrderFilters['status']>
            value={filters.status}
            onChange={(status) => setFilter('status', status)}
            ariaLabel={t('order.orderStatus')}
            className="w-max"
            options={[
              { value: 'ALL', label: t('common.all'), count: allOrders.length },
              ...ORDER_STATUSES.map((status) => ({
                value: status,
                label: t(`order.status.${status}`),
                count: countByStatus[status],
              })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-2.5 pt-1 border-t border-border/40 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t('order.searchPlaceholder')}
            aria-label={t('order.searchPlaceholder')}
            wrapperClassName="lg:max-w-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
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
                className="rounded-lg text-xs"
                onClick={() => {
                  setFilters(DEFAULT_ORDER_FILTERS)
                  setPage(1)
                }}
              >
                <RotateCcw className="size-3 mr-1" aria-hidden />
                {t('common.reset')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            icon={<ShoppingCart className="size-8 text-muted-foreground" />}
            title={isFiltered ? t('order.noMatches') : t('order.empty')}
            description={
              isFiltered ? t('order.noMatchesHint') : t('order.emptyHint')
            }
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  className="rounded-lg text-xs"
                  onClick={() => {
                    setFilters(DEFAULT_ORDER_FILTERS)
                    setPage(1)
                  }}
                >
                  <RotateCcw className="size-3.5 mr-1" aria-hidden />
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
          dataSource={data?.meta ? toPagination(filtered, data.meta) : paginateLocal(filtered, page, limit)}
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
          hasNumbers
          hasPagination
          hasColumnsVisibilityDropdown
        />
      )}
    </div>
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
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {label}:
      </span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={cn(controlClass, 'w-auto')}
      />
    </div>
  )
}
