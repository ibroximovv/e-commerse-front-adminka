import { useTranslation } from 'react-i18next'
import type { OrderStatus, PaymeState, PaymentStatus, Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const ORDER_STYLES: Record<OrderStatus, { dot: string; text: string; bg: string }> = {
  PENDING: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  SHIPPED: {
    bg: 'bg-purple-500/10 border-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  DELIVERED: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    bg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
}

const PAYMENT_STYLES: Record<PaymentStatus, { dot: string; text: string; bg: string }> = {
  PENDING: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  SUCCESSFUL: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    bg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  REFUNDED: {
    bg: 'bg-zinc-500/10 border-zinc-500/20',
    text: 'text-zinc-700 dark:text-zinc-300',
    dot: 'bg-zinc-500',
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  const style = ORDER_STYLES[status] ?? ORDER_STYLES.PENDING

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {t(`order.status.${status}`)}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation()
  const style = PAYMENT_STYLES[status] ?? PAYMENT_STYLES.PENDING

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {t(`payment.status.${status}`)}
    </span>
  )
}

/**
 * Payme tranzaksiyasining holati.
 *
 * `status` yolg'iz yetarli emas: bekor qilingan to'lov ham, qaytarilgan pul ham
 * `FAILED` bo'lib keladi — farqi faqat `payme_state` da
 * (`CANCELLED` va `CANCELLED_AFTER_PERFORM`).
 */
export function PaymeStateBadge({ state }: { state?: PaymeState | null }) {
  const { t } = useTranslation()
  if (!state) return <span className="text-muted-foreground">—</span>

  const tone: Record<PaymeState, string> = {
    CREATED: 'text-amber-700 dark:text-amber-300',
    PERFORMED: 'text-emerald-700 dark:text-emerald-300',
    CANCELLED: 'text-rose-700 dark:text-rose-300',
    CANCELLED_AFTER_PERFORM: 'text-zinc-700 dark:text-zinc-300',
  }

  return (
    <span className={cn('text-[11px] font-medium whitespace-nowrap', tone[state])}>
      {t(`payment.paymeState.${state}`)}
    </span>
  )
}

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation()
  const isAdmin = role === 'ADMIN'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        isAdmin
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${isAdmin ? 'bg-primary' : 'bg-muted-foreground'}`}
      />
      {t(`role.${role}`)}
    </span>
  )
}
