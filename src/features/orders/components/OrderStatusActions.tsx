import { Button } from 'dgz-ui/button'
import { useConfirm } from 'dgz-ui-shared/hooks'
import { Ban, Check, Loader2, PackageCheck, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useOrderMutations } from '../hooks'
import type { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_FLOW } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  PENDING: Loader2,
  CONFIRMED: Check,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: Ban,
}

/**
 * Faqat RUXSAT ETILGAN keyingi statuslarni tugma qilib chiqaradi.
 * Backend ketma-ketlikni tekshirmaydi (`DELIVERED` dan `PENDING` ga ham
 * qaytaradi) — cheklov faqat shu yerda, `ORDER_STATUS_FLOW` orqali.
 */
export function OrderStatusActions({
  order,
  size = 'sm',
}: {
  order: Order
  size?: 'sm' | 'default'
}) {
  const { t } = useTranslation()
  const { confirm } = useConfirm()
  const { updateStatus } = useOrderMutations()

  const next = ORDER_STATUS_FLOW[order.status]

  if (next.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">{t('order.finalStatus')}</span>
    )
  }

  const apply = (status: OrderStatus) => {
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () =>
          toast.success(t('order.statusChanged', { status: t(`order.status.${status}`) })),
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
      },
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((status) => {
        const Icon = STATUS_ICONS[status]
        const destructive = status === 'CANCELLED'

        return (
          <Button
            key={status}
            type="button"
            size={size}
            variant={destructive ? 'ghost' : 'default'}
            disabled={updateStatus.isPending}
            className={
              destructive
                ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                : undefined
            }
            /* Bekor qilish va yetkazildi — ortga qaytmaydigan amallar. */
            onClick={() => {
              if (destructive || status === 'DELIVERED') {
                confirm({ onConfirm: () => apply(status) })
              } else {
                apply(status)
              }
            }}
          >
            <Icon className="size-4" aria-hidden />
            {t(`order.action.${status}`)}
          </Button>
        )
      })}
    </div>
  )
}
