import { ImageOff, PackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { fileUrl } from '@/lib/api'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export function OrderItemsCard({ order }: { order: Order }) {
  const { t } = useTranslation()
  const items = order.items ?? []

  return (
    <SectionCard
      title={t('order.items')}
      description={t('order.itemsCount', { value: items.length })}
      icon={PackageSearch}
      contentClassName="p-0"
    >
      {items.length === 0 ? (
        <EmptyState title={t('order.noItems')} description="" className="py-8" />
      ) : (
        <>
          <ul className="divide-y divide-border border-t border-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                  {item.product?.images?.[0] ? (
                    <img
                      src={fileUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageOff className="size-5 text-muted-foreground/60" aria-hidden />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.product?.name ?? t('common.none')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {/* Buyurtma paytidagi narx — mahsulotning hozirgi narxi emas. */}
                    {formatPrice(item.price_at_purchase)} × {item.quantity}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3.5">
            <span className="text-sm font-medium text-foreground">
              {t('order.total')}
            </span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </>
      )}
    </SectionCard>
  )
}
