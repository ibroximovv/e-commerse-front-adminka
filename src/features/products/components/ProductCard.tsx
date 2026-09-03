import { Button } from 'dgz-ui/button'
import { Archive, ArchiveRestore, Edit, Package, Star, Trash2, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fileUrl } from '@/lib/api'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onToggleArchive: (product: Product) => void
  onToggleTop?: (product: Product) => void
  onToggleFeatured?: (product: Product) => void
  onUpdateStock?: (product: Product) => void
  onViewReviews?: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({
  product,
  onEdit,
  onToggleArchive,
  onToggleTop,
  onToggleFeatured,
  onUpdateStock,
  onViewReviews,
  onDelete,
}: ProductCardProps) {
  const { t } = useTranslation()
  const firstImage = product.images?.[0]

  const displayPrice = product.final_price ?? product.price
  const hasDiscount = (product.discount_percent ?? 0) > 0

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/40">
      {/* Image Header with minimal badging */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
        {firstImage ? (
          <img
            src={fileUrl(firstImage)}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <Package className="size-8" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1 max-w-[90%]">
          {hasDiscount && (
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{product.discount_percent}%
            </span>
          )}
          {product.is_top && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              TOP
            </span>
          )}
          {product.is_featured && (
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              Featured
            </span>
          )}
          {product.is_archived && (
            <span className="rounded bg-zinc-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
              {t('category.archived')}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-semibold text-foreground" title={product.name}>
              {product.name}
            </h3>
            {product.brand && (
              <span className="text-[10px] text-muted-foreground">{product.brand}</span>
            )}
          </div>
          {product.sku && (
            <span className="font-mono text-[10px] text-muted-foreground shrink-0" title="SKU">
              {product.sku}
            </span>
          )}
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {product.description}
          </p>
        ) : null}

        {/* Price & Stock Capsule */}
        <div className="mt-auto pt-2.5 flex items-baseline justify-between gap-2">
          {/* Narxsiz mahsulot savatga tushmaydi — 0 so'm ko'rsatish chalg'itadi */}
          {product.price_on_request ? (
            <span className="rounded-md bg-warning-muted px-2 py-0.5 text-[10px] font-medium text-warning">
              {t('product.priceOnRequestShort')}
            </span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onUpdateStock?.(product)}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              product.stock > 0
                ? 'bg-muted text-foreground'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {product.stock > 0
              ? `${product.stock} ${t('product.inStock')}`
              : t('product.outOfStock')}
          </button>
        </div>

        {/* Reviews and Ratings Bar */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
          <button
            type="button"
            onClick={() => onViewReviews?.(product)}
            className="flex items-center gap-1 hover:text-foreground cursor-pointer"
          >
            <Star className="size-3 text-amber-500 fill-amber-500" />
            <span className="font-medium text-foreground">{product.rating ?? 0}</span>
            <span>({product.rating_count ?? 0})</span>
          </button>

          <span className="text-[10px]">
            {product.sales_count ?? 0} ta sotildi
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-2.5 py-1.5">
        <div className="flex items-center gap-1">
          {onToggleTop && (
            <button
              type="button"
              onClick={() => onToggleTop(product)}
              title="TOP Flag"
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                product.is_top
                  ? 'bg-amber-500 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              TOP
            </button>
          )}
          {onToggleFeatured && (
            <button
              type="button"
              onClick={() => onToggleFeatured(product)}
              title="Featured Flag"
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                product.is_featured
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              FT
            </button>
          )}
          {onUpdateStock && (
            <button
              type="button"
              onClick={() => onUpdateStock(product)}
              title={t('product.updateStock')}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Layers className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
            title={t('common.edit')}
            className="rounded h-6 px-1.5 text-xs font-normal"
          >
            <Edit className="size-3 mr-1" />
            {t('common.edit')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleArchive(product)}
            title={product.is_archived ? t('category.unarchive') : t('category.archive')}
            className="rounded size-6"
          >
            {product.is_archived ? (
              <ArchiveRestore className="size-3 text-brand" />
            ) : (
              <Archive className="size-3 text-muted-foreground" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(product)}
            title={t('common.delete')}
            className="rounded size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
