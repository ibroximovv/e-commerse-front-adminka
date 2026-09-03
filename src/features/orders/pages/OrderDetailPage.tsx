import { Button } from 'dgz-ui/button'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { ArrowLeft, CreditCard, ListChecks, Mail, Phone, UserCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { OrderItemsCard } from '../components/OrderItemsCard'
import { OrderStatusActions } from '../components/OrderStatusActions'
import { OrderTimeline } from '../components/OrderTimeline'
import { useOrder, useOrderMutations } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { NotFoundPage } from '@/components/ui/ErrorPage'
import { SectionCard } from '@/components/ui/SectionCard'
import { OrderStatusBadge, PaymeStateBadge, PaymentStatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { fileUrl } from '@/lib/api'
import { errorMessage, formatDateTime, formatPrice, initials, shortId } from '@/lib/utils'

export function OrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState(false)

  const { data: order, isLoading, isError, error, refetch } = useOrder(id)
  const { archive } = useOrderMutations()
  useDocumentTitle(`${t('order.detailTitle')} ${shortId(id)}`)

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text)
    toast.success(msg)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleArchive = async () => {
    if (!order) return
    try {
      await archive.mutateAsync(order.id)
      toast.success(t('order.orderArchived'))
    } catch (err) {
      toast.error(errorMessage(err, t('error.generic')))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-60 rounded-lg" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
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
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono font-semibold">#{shortId(order.id)}</span>
            <OrderStatusBadge status={order.status} />
            {order.is_archived && (
              <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t('common.archived')}
              </span>
            )}
          </span>
        }
        description={`${t('common.date')}: ${formatDateTime(order.created_at)}`}
        actions={
          <div className="flex items-center gap-2">
            {!order.is_archived && (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-lg text-xs"
                onClick={handleArchive}
                disabled={archive.isPending}
              >
                {t('order.archiveOrder')}
              </Button>
            )}
            <Button variant="secondary" size="sm" className="rounded-lg text-xs" asChild>
              <Link to="/orders">
                <ArrowLeft className="size-3.5 mr-1" aria-hidden />
                {t('common.back')}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left Column: Order Items & Status Timeline / Controls */}
        <div className="space-y-5 lg:col-span-2">
          <OrderItemsCard order={order} />

          <SectionCard
            title={t('order.changeStatus')}
            description={t('order.changeStatusHint')}
            icon={ListChecks}
            contentClassName="space-y-4 p-4 sm:p-5 pt-0"
          >
            <OrderTimeline status={order.status} />
            <div className="pt-2 border-t border-border">
              <OrderStatusActions order={order} />
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Customer, Payment & Order Summary */}
        <div className="space-y-5">
          {/* Customer & Shipping Info Card */}
          <SectionCard
            title={t('order.customer')}
            icon={UserCircle}
            contentClassName="space-y-3.5 p-4 sm:p-5 pt-0 text-xs"
          >
            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  {user.photo ? (
                    <img
                      src={fileUrl(user.photo)}
                      alt=""
                      className="size-9 shrink-0 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-semibold text-foreground">
                      {initials(user.full_name, user.email)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {order.customer_name || user.full_name || t('common.none')}
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

                <div className="space-y-1.5 pt-1 border-t border-border/40 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3 text-muted-foreground" aria-hidden />
                      <span className="truncate max-w-[170px]">{user.email}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.email, t('common.copied'))}
                      className="p-0.5 hover:text-foreground"
                      title={t('common.copy')}
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>

                  {(order.customer_phone || user.phone) && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground" aria-hidden />
                        <span>{order.customer_phone || user.phone}</span>
                      </span>
                      <a
                        href={`tel:${order.customer_phone || user.phone}`}
                        className="text-brand hover:underline text-[11px]"
                      >
                        {t('order.callCustomer')}
                      </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-xs">{t('common.none')}</p>
            )}

            {/* Shipping address & Notes */}
            {(order.shipping_address || order.notes) && (
              <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                {order.shipping_address && (
                  <div>
                    <span className="font-medium text-foreground block mb-0.5">
                      {t('order.shippingAddress')}:
                    </span>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded-md border border-border/40">
                      {order.shipping_address}
                    </p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <span className="font-medium text-foreground block mb-0.5">
                      {t('order.customerNotes')}:
                    </span>
                    <p className="text-muted-foreground italic bg-muted/20 p-2 rounded-md border border-border/40">
                      "{order.notes}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Payment Card */}
          <SectionCard
            title={t('order.payment')}
            description={t('order.paymentReadOnly')}
            icon={CreditCard}
            contentClassName="space-y-2.5 p-4 sm:p-5 pt-0 text-xs"
          >
            {payment ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{t('order.paymentStatus')}</span>
                  <PaymentStatusBadge status={payment.status} />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{t('order.amount')}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatPrice(payment.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{t('order.provider')}</span>
                  <span className="font-medium text-foreground">{order.payment_method || payment.provider}</span>
                </div>

                {/*
                 * `status` yolg'iz yetarli emas: bekor qilingan va qaytarilgan
                 * to'lov ikkalasi ham `FAILED` bo'lib keladi — farqi
                 * `payme_state` da.
                 */}
                {payment.payme_state ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{t('payment.paymeStateLabel')}</span>
                    <PaymeStateBadge state={payment.payme_state} />
                  </div>
                ) : null}

                {payment.payme_transaction_id ? (
                  <div className="flex items-start justify-between gap-2 border-t border-border/40 pt-2">
                    <span className="shrink-0 text-muted-foreground">
                      {t('order.transactionId')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(payment.payme_transaction_id!, t('common.copied'))
                      }
                      className="group flex items-center gap-1 font-mono text-[11px] text-foreground hover:text-brand"
                    >
                      <span className="break-all text-right">{payment.payme_transaction_id}</span>
                      <Copy className="size-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  </div>
                ) : null}

                {payment.payme_perform_time ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{t('payment.performedAt')}</span>
                    <span className="text-foreground">
                      {/* Payme vaqtlari — millisekundlik timestamp, ISO satr emas */}
                      {formatDateTime(new Date(payment.payme_perform_time).toISOString())}
                    </span>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground text-xs">{t('order.noPayment')}</p>
            )}
          </SectionCard>

          {/* Summary Card */}
          <SectionCard
            title={t('order.summary')}
            contentClassName="space-y-2 p-4 sm:p-5 pt-0 text-xs"
          >
            <SummaryRow
              label={t('order.id')}
              value={`#${order.id}`}
              mono
              onCopy={() => copyToClipboard(order.id, t('common.copied'))}
              copied={copiedId}
            />
            <SummaryRow label={t('order.createdAt')} value={formatDateTime(order.created_at)} />
            <SummaryRow label={t('order.updatedAt')} value={formatDateTime(order.updated_at)} />
            <SummaryRow label={t('order.itemsShort')} value={String(order.items?.length ?? 0)} />
            
            <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
              <span className="font-semibold text-foreground">{t('order.total')}</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
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
  onCopy,
  copied,
}: {
  label: string
  value: string
  mono?: boolean
  onCopy?: () => void
  copied?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={mono ? 'font-mono text-foreground font-medium truncate max-w-[150px]' : 'text-foreground font-medium'}>
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-muted-foreground hover:text-foreground p-0.5"
            title={t('common.copy')}
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          </button>
        )}
      </div>
    </div>
  )
}
