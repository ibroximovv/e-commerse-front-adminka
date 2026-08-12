import { useTranslation } from 'react-i18next'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { OrderStatusBadge } from '@/components/ui/StatusBadge'
import type { Order } from '@/lib/types'
import { formatDateTime, formatPrice, initials } from '@/lib/utils'

export function RecentOrders({ orders }: { orders: Order[] }) {
  const { t } = useTranslation()

  return (
    <SectionCard
      title={t('dashboard.recentOrders')}
      className="h-full"
      contentClassName="p-0 pb-2"
    >
      {orders.length === 0 ? (
        <EmptyState
          title={t('dashboard.recentOrdersEmpty')}
          description=""
          className="py-6"
        />
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {initials(order.user?.full_name, order.user?.email)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {order.user?.full_name || order.user?.email || t('common.none')}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {formatPrice(order.total_amount)}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
