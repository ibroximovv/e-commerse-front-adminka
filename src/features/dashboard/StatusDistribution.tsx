import { useTranslation } from 'react-i18next'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { ORDER_STATUSES } from '@/lib/types'
import type { OrderStatus } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

/*
 * Diagramma uchun alohida kutubxona olinmadi: beshta qatorli gorizontal bar
 * uchun bu ortiqcha bo'lardi va ranglar token tizimidan chiqib ketardi.
 */
const BAR_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-warning',
  CONFIRMED: 'bg-info',
  SHIPPED: 'bg-chart-1',
  DELIVERED: 'bg-success',
  CANCELLED: 'bg-destructive',
}

export function StatusDistribution({
  byStatus,
  total,
}: {
  byStatus: Record<OrderStatus, number>
  total: number
}) {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('dashboard.ordersByStatus')} className="h-full">
      {total === 0 ? (
        <EmptyState
          title={t('dashboard.ordersByStatusEmpty')}
          description=""
          className="py-6"
        />
      ) : (
        <ul className="space-y-4">
          {ORDER_STATUSES.map((status) => {
            const count = byStatus[status] ?? 0
            const percent = total ? Math.round((count / total) * 100) : 0

            return (
              <li key={status} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate text-muted-foreground">
                    {t(`order.status.${status}`)}
                  </span>
                  <span className="shrink-0 tabular-nums font-medium text-foreground">
                    {formatNumber(count)}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {percent}%
                    </span>
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${t(`order.status.${status}`)}: ${count} (${percent}%)`}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${BAR_COLORS[status]}`}
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
