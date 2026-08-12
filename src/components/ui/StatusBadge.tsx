import { Badge } from 'dgz-ui/badge'
import { useTranslation } from 'react-i18next'
import type { OrderStatus, PaymentStatus, Role } from '@/lib/types'

/*
 * Status ranglari BITTA joyda. Rang hech qachon yagona signal emas — har doim
 * matn yorlig'i bilan birga keladi (rang ko'rmaydiganlar uchun).
 */

type BadgeVariant = 'gray' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'indigo'

const ORDER_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
}

const PAYMENT_VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  PENDING: 'orange',
  SUCCESSFUL: 'green',
  FAILED: 'red',
  REFUNDED: 'gray',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()

  return (
    <Badge type="status" variant={ORDER_VARIANTS[status]} rounded="full">
      {t(`order.status.${status}`)}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()

  return (
    <Badge type="status" variant={PAYMENT_VARIANTS[status]} rounded="full">
      {t(`payment.status.${status}`)}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation()

  return (
    <Badge variant={role === 'ADMIN' ? 'indigo' : 'gray'} rounded="full">
      {t(`role.${role}`)}
    </Badge>
  )
}
