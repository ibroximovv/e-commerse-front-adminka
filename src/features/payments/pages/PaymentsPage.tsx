import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getPaymentColumns } from '../components/columns'
import { usePayments } from '../hooks'
import {
  DEFAULT_PAYMENT_FILTERS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  type PaymentFilters,
} from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { NativeSelect, SearchInput } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { paginateLocal, toPagination } from '@/lib/api'
import type { Payment } from '@/lib/types'
import { formatNumber, formatPrice } from '@/lib/utils'

function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-foreground sm:text-xl">
        {value}
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}

export function PaymentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('payment.title'))

  const navigate = useNavigate()
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_PAYMENT_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  /*
   * Qidiruv SERVERDA: `search` Payme tranzaksiya ID, buyurtma ID va provayder
   * bo'yicha qidiradi. Mijozda filtrlash faqat joriy sahifani ko'rar edi —
   * boshqa sahifadagi tranzaksiya topilmasdi.
   */
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  const { data, isLoading, isError, error, refetch } = usePayments({
    page,
    limit,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    provider: filters.provider !== 'ALL' ? filters.provider : undefined,
    search: debouncedSearch || undefined,
  })

  const payments = useMemo(() => data?.items ?? [], [data?.items])

  const stats = useMemo(() => {
    let totalRevenue = 0
    let successfulCount = 0
    let pendingCount = 0
    let failedCount = 0

    for (const p of payments) {
      if (p.status === 'SUCCESSFUL') {
        totalRevenue += p.amount
        successfulCount += 1
      } else if (p.status === 'PENDING') {
        pendingCount += 1
      } else if (p.status === 'FAILED' || p.status === 'REFUNDED') {
        failedCount += 1
      }
    }

    return { totalRevenue, successfulCount, pendingCount, failedCount }
  }, [payments])

  const columns = useMemo(
    () =>
      getPaymentColumns({
        onViewOrder: (orderId) => navigate(`/orders/${orderId}`),
        t,
      }),
    [navigate, t],
  )

  const setFilter = <K extends keyof PaymentFilters>(key: K, value: PaymentFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const isFiltered =
    filters.search !== '' || filters.status !== 'ALL' || filters.provider !== 'ALL'

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title={t('payment.title')} description={t('payment.subtitle')} />
        <TableSkeleton rows={6} columns={7} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const totalCount = data?.meta?.total ?? payments.length

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('payment.title')}
        description={t('payment.subtitle')}
        actions={
          <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {t('payment.totalCount', { value: totalCount })}
          </span>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile
          label={t('payment.totalPaid')}
          value={formatPrice(stats.totalRevenue)}
          hint={t('payment.successfulCount', { count: stats.successfulCount })}
        />
        <StatTile
          label={t('payment.pendingPayments')}
          value={formatNumber(stats.pendingCount)}
          hint={t('payment.pendingHint')}
        />
        <StatTile
          label={t('payment.failedPayments')}
          value={formatNumber(stats.failedCount)}
          hint={t('payment.failedHint')}
        />
        <StatTile
          label={t('payment.totalTransactions')}
          value={formatNumber(totalCount)}
          hint={t('payment.totalTransactionsHint')}
        />
      </div>

      {/* Filter panel */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
        <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
          <Segmented<PaymentFilters['status']>
            value={filters.status}
            onChange={(status) => setFilter('status', status)}
            ariaLabel={t('payment.statusLabel')}
            className="w-max"
            options={[
              { value: 'ALL', label: t('common.all') },
              ...PAYMENT_STATUSES.map((status) => ({
                value: status,
                label: t(`payment.status.${status}`),
              })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-2.5 border-t border-border pt-2.5 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t('payment.searchPlaceholder')}
            aria-label={t('payment.searchPlaceholder')}
            wrapperClassName="lg:max-w-sm"
          />

          <div className="flex flex-wrap items-center gap-2">
            <NativeSelect
              value={filters.provider}
              onChange={(e) => setFilter('provider', e.target.value)}
              className="w-auto min-w-[130px]"
            >
              <option value="ALL">{t('payment.allProviders')}</option>
              {PAYMENT_PROVIDERS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </NativeSelect>

            {isFiltered && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => {
                  setFilters(DEFAULT_PAYMENT_FILTERS)
                  setPage(1)
                }}
              >
                <RotateCcw className="size-3 mr-1" aria-hidden />
                {t('common.reset')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            title={isFiltered ? t('payment.noMatches') : t('payment.empty')}
            description={
              isFiltered
                ? t('payment.noMatchesHint')
                : t('payment.emptyHint')
            }
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  className="rounded-lg text-xs"
                  onClick={() => {
                    setFilters(DEFAULT_PAYMENT_FILTERS)
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
        <DataTable<Payment>
          tableKey="payments-table"
          rowKey="id"
          columns={columns}
          dataSource={
            data?.meta
              ? toPagination(payments, data.meta)
              : paginateLocal(payments, page, limit)
          }
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
