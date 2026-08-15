import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import { Card, CardContent, CardFooter, CardHeader } from 'dgz-ui/card'
import { Archive, ArchiveRestore, Edit, Package, Star, Flame, Sparkles, Trash2, Layers } from 'lucide-react'
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

  // Use final_price as actual price, fallback to price
  const displayPrice = product.final_price ?? product.price
  const hasDiscount = (product.discount_percent ?? 0) > 0

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:border-brand/50 hover:shadow-md">
      {/* Image header */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
        {firstImage ? (
          <img
            src={fileUrl(firstImage)}
            alt={product.name}
            className="size-full object-cover transition-transform duration-200 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <Package className="size-10" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
          {hasDiscount && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground shadow-xs">
              -{product.discount_percent}%
            </span>
          )}
          {product.is_top && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              <Flame className="size-3" /> TOP
            </span>
          )}
          {product.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
              <Sparkles className="size-3" /> Featured
            </span>
          )}
          {product.category?.name ? (
            <Badge variant="gray" size="sm" rounded="full" className="backdrop-blur-md">
              {product.category.name}
            </Badge>
          ) : null}
          {product.is_archived && (
            <Badge type="status" variant="gray" size="sm" rounded="full">
              {t('category.archived')}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold text-foreground" title={product.name}>
              {product.name}
            </h3>
            {product.brand && (
              <span className="text-xs font-medium text-brand">{product.brand}</span>
            )}
          </div>
          {product.sku && (
            <span className="font-mono text-[11px] text-muted-foreground" title="SKU">
              {product.sku}
            </span>
          )}
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
            {product.description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onUpdateStock?.(product)}
            className={`text-xs font-medium cursor-pointer hover:underline ${
              product.stock > 5
                ? 'text-success'
                : product.stock > 0
                ? 'text-warning font-semibold'
                : 'text-destructive font-semibold'
            }`}
          >
            {product.stock > 0
              ? `${product.stock} ${t('product.inStock')}`
              : t('product.outOfStock')}
          </button>
        </div>

        {/* Rating and Sales count */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
          <button
            type="button"
            onClick={() => onViewReviews?.(product)}
            className="flex items-center gap-1 hover:text-foreground cursor-pointer"
          >
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.rating ?? 0}</span>
            <span>({product.rating_count ?? 0})</span>
          </button>

          <div className="flex items-center gap-3 text-[11px]">
            <span>{t('product.sales')}: {product.sales_count ?? 0}</span>
            <span>Score: {product.popularity_score ?? 0}</span>
          </div>
        </div>

        {/* Tags / Attributes */}
        {product.tags && product.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-brand-muted px-1.5 py-0.5 text-[10px] font-medium text-brand"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border bg-muted/20 p-2.5">
        <div className="flex items-center gap-1">
          {onToggleTop && (
            <Button
              type="button"
              variant={product.is_top ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onToggleTop(product)}
              title="TOP Flag"
              className={product.is_top ? 'text-amber-500' : ''}
            >
              <Flame className="size-4" />
            </Button>
          )}
          {onToggleFeatured && (
            <Button
              type="button"
              variant={product.is_featured ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onToggleFeatured(product)}
              title="Featured Flag"
              className={product.is_featured ? 'text-indigo-600' : ''}
            >
              <Sparkles className="size-4" />
            </Button>
          )}
          {onUpdateStock && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onUpdateStock(product)}
              title={t('product.updateStock')}
            >
              <Layers className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(product)}
            title={t('common.edit')}
          >
            <Edit className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleArchive(product)}
            title={product.is_archived ? t('category.unarchive') : t('category.archive')}
          >
            {product.is_archived ? (
              <ArchiveRestore className="size-4 text-brand" />
            ) : (
              <Archive className="size-4 text-warning" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(product)}
            title={t('common.delete')}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
