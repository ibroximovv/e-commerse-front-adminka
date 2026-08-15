import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Archive, ArchiveRestore, Edit, Flame, Layers, Package, Sparkles, Star, Trash2 } from 'lucide-react'
import { fileUrl } from '@/lib/api'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface ColumnCallbacks {
  onEdit: (product: Product) => void
  onToggleArchive: (product: Product) => void
  onToggleTop?: (product: Product) => void
  onToggleFeatured?: (product: Product) => void
  onUpdateStock?: (product: Product) => void
  onViewReviews?: (product: Product) => void
  onDelete: (product: Product) => void
  t: (key: string) => string
}

export function getProductColumns({
  onEdit,
  onToggleArchive,
  onToggleTop,
  onToggleFeatured,
  onUpdateStock,
  onViewReviews,
  onDelete,
  t,
}: ColumnCallbacks): ColumnType<Product>[] {
  return [
    {
      key: 'image',
      dataIndex: 'images',
      name: '',
      render: (_: string[], record: Product) => {
        const img = record.images?.[0]
        return (
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
            {img ? (
              <img
                src={fileUrl(img)}
                alt={record.name}
                className="size-full object-cover"
              />
            ) : (
              <Package className="size-5 text-muted-foreground/60" />
            )}
          </div>
        )
      },
    },
    {
      key: 'name',
      dataIndex: 'name',
      name: t('product.name'),
      sortable: true,
      render: (val: string, record: Product) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{val}</span>
            {record.is_top && (
              <span title="TOP" className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                <Flame className="size-3" /> TOP
              </span>
            )}
            {record.is_featured && (
              <span title="Featured" className="inline-flex items-center gap-0.5 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                <Sparkles className="size-3" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {record.brand && <span className="font-medium text-brand">{record.brand}</span>}
            {record.sku && <span className="font-mono text-[11px] text-muted-foreground/80">SKU: {record.sku}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      dataIndex: 'category_id',
      name: t('product.category'),
      render: (_: string, record: Product) => (
        <Badge variant="gray" size="sm" rounded="full">
          {record.category?.name ?? t('common.none')}
        </Badge>
      ),
    },
    {
      key: 'price',
      dataIndex: 'final_price',
      name: t('product.price'),
      sortable: true,
      render: (_: unknown, record: Product) => {
        const displayPrice = record.final_price ?? record.price
        const hasDiscount = (record.discount_percent ?? 0) > 0

        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="rounded bg-destructive/10 px-1 py-0.2 text-[10px] font-bold text-destructive">
                  -{record.discount_percent}%
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(record.price)}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'stock',
      dataIndex: 'stock',
      name: t('product.stock'),
      sortable: true,
      render: (val: number, record: Product) => (
        <button
          type="button"
          onClick={() => onUpdateStock?.(record)}
          className="flex items-center gap-1 text-xs font-medium cursor-pointer hover:underline"
        >
          <span
            className={
              val > 5
                ? 'text-foreground'
                : val > 0
                ? 'text-warning font-semibold'
                : 'text-destructive font-semibold'
            }
          >
            {val > 0 ? val : t('product.outOfStock')}
          </span>
          <Layers className="size-3 text-muted-foreground/60" />
        </button>
      ),
    },
    {
      key: 'rating',
      dataIndex: 'rating',
      name: t('product.rating'),
      sortable: true,
      render: (_: unknown, record: Product) => (
        <button
          type="button"
          onClick={() => onViewReviews?.(record)}
          className="flex items-center gap-1 text-xs hover:text-foreground cursor-pointer"
        >
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{record.rating ?? 0}</span>
          <span className="text-[11px] text-muted-foreground">({record.rating_count ?? 0})</span>
        </button>
      ),
    },
    {
      key: 'status',
      dataIndex: 'is_archived',
      name: t('category.status'),
      sortable: true,
      render: (is_archived: boolean) => (
        <Badge
          type="status"
          variant={is_archived ? 'gray' : 'green'}
          rounded="full"
        >
          {is_archived ? t('category.archived') : t('category.active')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      dataIndex: 'id',
      name: t('common.actions'),
      render: (_: string, record: Product) => (
        <div className="flex items-center justify-end gap-1">
          {onToggleTop && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onToggleTop(record)}
              title="TOP Flag"
              className={record.is_top ? 'text-amber-500' : 'text-muted-foreground'}
            >
              <Flame className="size-4" />
            </Button>
          )}

          {onToggleFeatured && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onToggleFeatured(record)}
              title="Featured Flag"
              className={record.is_featured ? 'text-indigo-600' : 'text-muted-foreground'}
            >
              <Sparkles className="size-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
            title={t('common.edit')}
          >
            <Edit className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleArchive(record)}
            title={record.is_archived ? t('category.unarchive') : t('category.archive')}
          >
            {record.is_archived ? (
              <ArchiveRestore className="size-4 text-brand" />
            ) : (
              <Archive className="size-4 text-warning" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(record)}
            title={t('common.delete')}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}
