import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SectionCard } from '@/components/ui/SectionCard'
import { EmptyState } from '@/components/ui/States'
import { fileUrl } from '@/lib/api'
import type { Product } from '@/lib/types'
import { formatNumber, formatPrice } from '@/lib/utils'

export function TopProducts({ products = [] }: { products?: Product[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <SectionCard
      title={t('dashboard.topProductsTitle')}
      description={t('dashboard.topProductsSubtitle')}
      className="h-full"
      contentClassName="p-0 pb-1"
    >
      {products.length === 0 ? (
        <EmptyState
          title={t('dashboard.topProductsEmpty')}
          description=""
          className="py-6"
        />
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border">
          {products.map((product, idx) => {
            const image = product.images?.[0]
            return (
              <li
                key={product.id}
                onClick={() => navigate('/products')}
                className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="font-mono text-xs text-muted-foreground w-4">
                  {idx + 1}
                </span>

                <div className="size-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40">
                  {image ? (
                    <img
                      src={fileUrl(image)}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <Package className="size-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    {product.brand && (
                      <span className="truncate">{product.brand}</span>
                    )}
                    <span>·</span>
                    <span>
                      {formatNumber(product.sales_count ?? 0)} ta sotildi
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {formatPrice(product.final_price ?? product.price)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Zaxira: {product.stock}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
