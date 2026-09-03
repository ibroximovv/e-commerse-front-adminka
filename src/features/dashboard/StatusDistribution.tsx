import { useTranslation } from 'react-i18next'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { ORDER_STATUSES } from '@/lib/types'
import type { OrderStatus } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

const BAR_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-blue-500',
  SHIPPED: 'bg-purple-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
}

export function StatusDistribution({
  orders,
  byStatus,
  total,
}: {
  orders?: {
    total: number
    pending: number
    confirmed: number
    shipped: number
    delivered: number
    cancelled: number
  }
  byStatus?: Record<OrderStatus, number>
  total?: number
}) {
  const { t } = useTranslation()

  const counts: Record<OrderStatus, number> = {
    PENDING: orders?.pending ?? byStatus?.PENDING ?? 0,
    CONFIRMED: orders?.confirmed ?? byStatus?.CONFIRMED ?? 0,
    SHIPPED: orders?.shipped ?? byStatus?.SHIPPED ?? 0,
    DELIVERED: orders?.delivered ?? byStatus?.DELIVERED ?? 0,
    CANCELLED: orders?.cancelled ?? byStatus?.CANCELLED ?? 0,
  }

  const totalOrders = orders?.total ?? total ?? Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <SectionCard title={t('dashboard.ordersByStatus')} className="h-full">
      {totalOrders === 0 ? (
        <EmptyState
          title={t('dashboard.ordersByStatusEmpty')}
          description=""
          className="py-6"
        />
      ) : (
        <ul className="space-y-3.5">
          {ORDER_STATUSES.map((status) => {
            const count = counts[status] ?? 0
            const percent = totalOrders ? Math.round((count / totalOrders) * 100) : 0

            return (
              <li key={status} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate text-muted-foreground">
                    {t(`order.status.${status}`)}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium text-foreground">
                    {formatNumber(count)}
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      ({percent}%)
                    </span>
                  </span>
                </div>

                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${t(`order.status.${status}`)}: ${count} (${percent}%)`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${BAR_COLORS[status]}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
