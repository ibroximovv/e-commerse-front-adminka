import { Button } from 'dgz-ui/button'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { ArrowLeft, CreditCard, ListChecks, Mail, Phone, UserCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OrderItemsCard } from '../components/OrderItemsCard'
import { OrderStatusActions } from '../components/OrderStatusActions'
import { OrderTimeline } from '../components/OrderTimeline'
import { useOrder } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { NotFoundPage } from '@/components/ui/ErrorPage'
import { SectionCard } from '@/components/ui/SectionCard'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { fileUrl } from '@/lib/api'
import { formatDateTime, formatPrice, initials, shortId } from '@/lib/utils'

export function OrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { order, isLoading, isError, error, refetch } = useOrder(id)
  useDocumentTitle(`${t('order.detailTitle')} ${shortId(id)}`)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 w-full lg:col-span-2" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  if (!order) {
    return <NotFoundPage />
  }

  const user = order.user
  const payment = order.payment

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{shortId(order.id)}</span>
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={formatDateTime(order.created_at)}
        actions={
          <Button variant="secondary" asChild>
            <Link to="/orders">
              <ArrowLeft className="size-4" aria-hidden />
              {t('common.back')}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OrderItemsCard order={order} />

          <SectionCard
            title={t('order.changeStatus')}
            description={t('order.changeStatusHint')}
            icon={ListChecks}
            contentClassName="space-y-5 p-5 pt-0"
          >
            <OrderTimeline status={order.status} />
            <OrderStatusActions order={order} />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title={t('order.customer')}
            icon={UserCircle}
            contentClassName="space-y-3 p-5 pt-0 text-sm"
          >
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  {user.photo ? (
                    <img
                      src={fileUrl(user.photo)}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {initials(user.full_name, user.email)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {user.full_name || t('common.none')}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/users?search=${encodeURIComponent(user.email)}`)}
                      className="text-xs text-brand hover:underline"
                    >
                      {t('order.viewCustomer')}
                    </button>
                  </div>
                </div>

                <p className="flex items-center gap-2 break-all text-muted-foreground">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {user.email}
                </p>

                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  {user.phone || t('common.none')}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">{t('common.none')}</p>
            )}
          </SectionCard>

          <SectionCard
            title={t('order.payment')}
            /* To'lov tugmasi ATAYIN yo'q: POST /api/payments faqat o'z
               buyurtmasi uchun ishlaydi, admin boshqa nomdan to'lay olmaydi. */
            description={t('order.paymentReadOnly')}
            icon={CreditCard}
            contentClassName="space-y-3 p-5 pt-0 text-sm"
          >
            {payment ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('order.paymentStatus')}</span>
                  <PaymentStatusBadge status={payment.status} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('order.amount')}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatPrice(payment.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('order.provider')}</span>
                  <span className="text-foreground">{payment.provider}</span>
                </div>

                {payment.transaction_id ? (
                  <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                    <span className="shrink-0 text-muted-foreground">
                      {t('order.transactionId')}
                    </span>
                    <span className="break-all text-right font-mono text-xs text-foreground">
                      {payment.transaction_id}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">{t('order.noPayment')}</p>
            )}
          </SectionCard>

          <SectionCard
            title={t('order.summary')}
            contentClassName="space-y-2.5 p-5 pt-0 text-sm"
          >
            <SummaryRow label={t('order.id')} value={shortId(order.id)} mono />
            <SummaryRow label={t('order.createdAt')} value={formatDateTime(order.created_at)} />
            <SummaryRow label={t('order.updatedAt')} value={formatDateTime(order.updated_at)} />
            <SummaryRow label={t('order.itemsShort')} value={String(order.items?.length ?? 0)} />
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="font-medium text-foreground">{t('order.total')}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs text-foreground' : 'text-foreground'}>
        {value}
      </span>
    </div>
  )
}
