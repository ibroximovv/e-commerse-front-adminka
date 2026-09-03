import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { ExternalLink } from 'lucide-react'
import { CopyableText } from '@/components/ui/CopyableText'
import { PaymentStatusBadge, PaymeStateBadge } from '@/components/ui/StatusBadge'
import type { Payment, PaymeState, PaymentStatus } from '@/lib/types'
import { formatDateTime, formatPrice, shortId } from '@/lib/utils'

interface ColumnCallbacks {
  onViewOrder?: (orderId: string) => void
  t: (key: string) => string
}

export function getPaymentColumns({
  onViewOrder,
  t,
}: ColumnCallbacks): ColumnType<Payment>[] {
  return [
    {
      key: 'id',
      dataIndex: 'id',
      name: t('payment.id'),
      render: (val: string) => (
        <CopyableText text={val} label={t('payment.copyId')} />
      ),
    },
    {
      key: 'order_id',
      dataIndex: 'order_id',
      name: t('payment.order'),
      render: (val?: string) => {
        if (!val) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">
              #{shortId(val)}
            </span>
            {onViewOrder && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onViewOrder(val)}
                className="size-6 rounded-md hover:text-brand"
                title={t('order.viewDetail')}
              >
                <ExternalLink className="size-3" />
              </Button>
            )}
          </div>
        )
      },
    },
    {
      key: 'amount',
      dataIndex: 'amount',
      name: t('payment.amount'),
      sortable: true,
      render: (val: number) => (
        <span className="font-mono text-xs font-bold tabular-nums text-foreground">
          {formatPrice(val)}
        </span>
      ),
    },
    {
      key: 'provider',
      dataIndex: 'provider',
      name: t('payment.provider'),
      render: (val: string) => (
        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium uppercase text-foreground">
          {val || 'payme'}
        </span>
      ),
    },
    {
      key: 'status',
      dataIndex: 'status',
      name: t('payment.statusLabel'),
      sortable: true,
      render: (val: PaymentStatus) => <PaymentStatusBadge status={val} />,
    },
    {
      key: 'payme_state',
      dataIndex: 'payme_state',
      name: t('payment.paymeStateLabel'),
      render: (val?: PaymeState | null) => <PaymeStateBadge state={val} />,
    },
    {
      key: 'payme_transaction_id',
      dataIndex: 'payme_transaction_id',
      name: t('payment.transactionId'),
      render: (val?: string | null) => {
        if (!val) return <span className="text-muted-foreground">—</span>
        return <CopyableText text={val} label={t('payment.copyTransaction')} />
      },
    },
    {
      key: 'payme_perform_time',
      dataIndex: 'payme_perform_time',
      name: t('payment.performedAt'),
      sortable: true,
      // Payme vaqtlari — millisekundlik timestamp, ISO satr emas
      render: (val?: number | null) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {val ? formatDateTime(new Date(val).toISOString()) : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      dataIndex: 'created_at',
      name: t('payment.date'),
      sortable: true,
      render: (val?: string) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {val ? formatDateTime(val) : '—'}
        </span>
      ),
    },
  ]
}
