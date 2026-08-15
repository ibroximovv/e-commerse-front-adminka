import { Button } from 'dgz-ui/button'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { CheckCircle2, Star, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useProductReviews, useReviewSummary } from '../hooks'
import { productsApi } from '../api'
import type { Product } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ProductReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function ProductReviewsModal({
  isOpen,
  onClose,
  product,
}: ProductReviewsModalProps) {
  const { t } = useTranslation()
  const productId = product?.id

  const { data: reviewsData, refetch: refetchReviews } = useProductReviews(productId)
  const { data: summaryData, refetch: refetchSummary } = useReviewSummary(productId)

  if (!product) return null

  const reviews = reviewsData?.items ?? []
  const summary = summaryData

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await productsApi.deleteReview(reviewId)
      toast.success(t('product.reviewDeleted'))
      void refetchReviews()
      void refetchSummary()
    } catch {
      toast.error(t('error.generic'))
    }
  }

  return (
    <MyModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      header={`${t('product.reviewsTitle')}: ${product.name}`}
      size="xl"
    >
      <div className="space-y-6 pt-2">
        {/* Rating summary bar */}
        {summary && (
          <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center border-b border-border/50 pb-3 sm:border-b-0 sm:border-r sm:pb-0">
              <span className="text-4xl font-extrabold text-foreground">{summary.average}</span>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= Math.round(summary.average)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {t('product.totalReviews')}: {summary.count}
              </span>
            </div>

            {/* Distribution bars */}
            <div className="space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution?.[String(star) as keyof typeof summary.distribution] ?? 0
                const percent = summary.count > 0 ? (count / summary.count) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-8 flex items-center gap-1 font-medium text-foreground">
                      {star} <Star className="size-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('product.noReviewsYet')}
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-lg border border-border bg-card p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {rev.user?.full_name || rev.user?.email || 'User'}
                    </span>
                    {rev.is_verified_purchase && (
                      <span className="flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-[10px] font-semibold text-success">
                        <CheckCircle2 className="size-3" />
                        {t('product.verifiedPurchase')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(rev.created_at)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDeleteReview(rev.id)}
                      className="size-7 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-3.5 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                {rev.comment && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </MyModal>
  )
}
