import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import { Card, CardContent, CardFooter, CardHeader } from 'dgz-ui/card'
import { Archive, ArchiveRestore, Edit, Package, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fileUrl } from '@/lib/api'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onToggleArchive: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({
  product,
  onEdit,
  onToggleArchive,
  onDelete,
}: ProductCardProps) {
  const { t } = useTranslation()
  const firstImage = product.images?.[0]

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
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
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
        <h3 className="line-clamp-1 text-base font-semibold text-foreground" title={product.name}>
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>

          <span
            className={`text-xs font-medium ${
              product.stock > 0 ? 'text-success' : 'text-destructive font-semibold'
            }`}
          >
            {product.stock > 0
              ? `${product.stock} ${t('product.inStock')}`
              : t('product.outOfStock')}
          </span>
        </div>

        {/* Attributes pills */}
        {product.attributes && product.attributes.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.attributes.slice(0, 3).map((attr, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {attr.key}: {attr.value}
              </span>
            ))}
            {product.attributes.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{product.attributes.length - 3}
              </span>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-1 border-t border-border bg-muted/20 p-2.5">
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
      </CardFooter>
    </Card>
  )
}
