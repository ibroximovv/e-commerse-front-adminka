import { Button } from 'dgz-ui/button'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useProductMutations } from '../hooks'
import type { Product } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

interface StockModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function StockModal({ isOpen, onClose, product }: StockModalProps) {
  const { t } = useTranslation()
  const { updateStock } = useProductMutations()
  const [quantity, setQuantity] = useState<number>(0)

  if (!product) return null

  const handleAdjust = (delta: number) => {
    setQuantity((prev) => prev + delta)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity === 0) {
      toast.info(t('product.stockNoChange'))
      onClose()
      return
    }

    updateStock.mutate(
      { id: product.id, quantity },
      {
        onSuccess: () => {
          toast.success(t('product.stockUpdated'))
          onClose()
        },
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
      },
    )
  }

  const resultingStock = product.stock + quantity

  return (
    <MyModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      header={t('product.updateStockTitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
          <p className="text-xs text-muted-foreground">{product.name}</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">{t('product.currentStock')}:</span>
            <span className="text-base font-bold text-foreground">{product.stock}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('product.adjustQuantity')} ({t('product.positiveAdds')})
          </label>

          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleAdjust(-5)}
            >
              -5
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleAdjust(-1)}
            >
              <Minus className="size-4" />
            </Button>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="h-10 w-24 text-center text-base font-bold rounded-md border border-input bg-background px-2 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleAdjust(1)}
            >
              <Plus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleAdjust(5)}
            >
              +5
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border p-3 text-center text-xs">
          <span className="text-muted-foreground">{t('product.newStock')}: </span>
          <span
            className={`font-bold ${
              resultingStock < 0 ? 'text-destructive' : 'text-brand'
            }`}
          >
            {resultingStock}
          </span>
          {resultingStock < 0 && (
            <p className="mt-1 text-[11px] text-destructive">
              {t('product.stockCannotBeNegative')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updateStock.isPending}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            disabled={updateStock.isPending || resultingStock < 0}
          >
            {updateStock.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </form>
    </MyModal>
  )
}
