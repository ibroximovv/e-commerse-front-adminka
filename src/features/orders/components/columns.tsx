import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Eye } from 'lucide-react'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge'
import type { Order } from '@/lib/types'
import { formatDateTime, formatPrice, initials, shortId } from '@/lib/utils'

interface ColumnCallbacks {
  onView: (order: Order) => void
  t: (key: string) => string
}

export function getOrderColumns({ onView, t }: ColumnCallbacks): ColumnType<Order>[] {
  return [
    {
      key: 'id',
      dataIndex: 'id',
      name: t('order.id'),
      render: (val: string) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {shortId(val)}
        </span>
      ),
    },
    {
      key: 'customer',
      dataIndex: 'user_id',
      name: t('order.customer'),
      render: (_: string, record: Order) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            {initials(record.user?.full_name, record.user?.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {record.user?.full_name || record.user?.email || t('common.none')}
            </p>
            {record.user?.full_name && record.user.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {record.user.email}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      dataIndex: 'items',
      name: t('order.items'),
      render: (items: Order['items']) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {items?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'total_amount',
      dataIndex: 'total_amount',
      name: t('order.total'),
      sortable: true,
      render: (val: number) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatPrice(val)}
        </span>
      ),
    },
    {
      key: 'status',
      dataIndex: 'status',
      name: t('order.orderStatus'),
      sortable: true,
      render: (_: unknown, record: Order) => <OrderStatusBadge status={record.status} />,
    },
    {
      key: 'payment',
      dataIndex: 'payment',
      name: t('order.payment'),
      render: (_: unknown, record: Order) =>
        record.payment ? (
          <PaymentStatusBadge status={record.payment.status} />
        ) : (
          <span className="text-xs text-muted-foreground">{t('order.noPayment')}</span>
        ),
    },
    {
      key: 'created_at',
      dataIndex: 'created_at',
      name: t('dashboard.date'),
      sortable: true,
      render: (val: string) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'actions',
      dataIndex: 'id',
      name: t('common.actions'),
      /*
       * `type: 'action'` YOZMANG — kutubxonaning `useColumns` hooki
       * `columns.filter((c) => c.type !== 'action')` qiladi va ustun
       * jadvaldan butunlay YO'QOLADI (amal tugmalari ko'rinmay qoladi).
       */
      render: (_: string, record: Order) => (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onView(record)}
            title={t('order.viewDetail')}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}
