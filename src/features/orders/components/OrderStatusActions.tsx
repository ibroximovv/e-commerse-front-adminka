import { Button } from 'dgz-ui/button'
import { Ban, Check, Loader2, PackageCheck, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useOrderMutations } from '../hooks'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
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

export function OrderStatusActions({
  order,
  size = 'sm',
}: {
  order: Order
  size?: 'sm' | 'default'
}) {
  const { t } = useTranslation()
  const { updateStatus } = useOrderMutations()
  const [confirmConfig, setConfirmConfig] = useState<(ConfirmOptions & { isOpen: boolean }) | null>(null)

  const openConfirm = (opts: ConfirmOptions) => {
    setConfirmConfig({ ...opts, isOpen: true })
  }

  const closeConfirm = () => {
    setConfirmConfig(null)
  }

  const next = ORDER_STATUS_FLOW[order.status]

  if (next.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">{t('order.finalStatus')}</span>
    )
  }

  const apply = async (status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast.success(t('order.statusChanged', { status: t(`order.status.${status}`) }))
    } catch (err) {
      toast.error(errorMessage(err, t('error.generic')))
    }
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
                ? 'rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive'
                : 'rounded-xl'
            }
            onClick={() => {
              if (destructive || status === 'DELIVERED') {
                openConfirm({
                  title: t('order.changeStatus'),
                  description: `${t(`order.action.${status}`)}: ${t('order.changeStatusHint')}`,
                  confirmText: t(`order.action.${status}`),
                  iconType: destructive ? 'warning' : 'info',
                  variant: destructive ? 'danger' : 'warning',
                  onConfirm: () => apply(status),
                })
              } else {
                void apply(status)
              }
            }}
          >
            <Icon className="size-4" aria-hidden />
            {t(`order.action.${status}`)}
          </Button>
        )
      })}

      {confirmConfig && (
        <ConfirmModal
          {...confirmConfig}
          onClose={closeConfirm}
        />
      )}
    </div>
  )
}
