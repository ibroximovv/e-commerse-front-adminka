import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { OrderStatusBadge } from '@/components/ui/StatusBadge'
import type { Order } from '@/lib/types'
import { formatDateTime, formatPrice, initials, shortId } from '@/lib/utils'

export function RecentOrders({ orders }: { orders: Order[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <SectionCard
      title={t('dashboard.recentOrders')}
      className="h-full"
      contentClassName="p-0 pb-1"
    >
      {orders.length === 0 ? (
        <EmptyState
          title={t('dashboard.recentOrdersEmpty')}
          description=""
          className="py-6"
        />
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border">
          {orders.map((order) => (
            <li
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                {initials(order.user?.full_name, order.user?.email)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium text-foreground">
                    {order.user?.full_name || order.user?.email || t('common.none')}
                  </p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    #{shortId(order.id)}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-semibold tabular-nums text-foreground">
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
