import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Archive, ArchiveRestore, Edit, Package, Trash2 } from 'lucide-react'
import { fileUrl } from '@/lib/api'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface ColumnCallbacks {
  onEdit: (product: Product) => void
  onToggleArchive: (product: Product) => void
  onDelete: (product: Product) => void
  t: (key: string) => string
}

export function getProductColumns({
  onEdit,
  onToggleArchive,
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
          <span className="font-medium text-foreground">{val}</span>
          {record.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {record.description}
            </p>
          ) : null}
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
      dataIndex: 'price',
      name: t('product.price'),
      sortable: true,
      render: (val: number) => (
        <span className="font-semibold text-foreground">
          {formatPrice(val)}
        </span>
      ),
    },
    {
      key: 'stock',
      dataIndex: 'stock',
      name: t('product.stock'),
      sortable: true,
      render: (val: number) => (
        <span
          className={`text-xs font-medium ${
            val > 0 ? 'text-foreground' : 'text-destructive font-semibold'
          }`}
        >
          {val > 0 ? val : t('product.outOfStock')}
        </span>
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
      /*
       * `type: 'action'` YOZMANG — kutubxonaning `useColumns` hooki
       * `columns.filter((c) => c.type !== 'action')` qiladi va ustun
       * jadvaldan butunlay YO'QOLADI (amal tugmalari ko'rinmay qoladi).
       */
      render: (_: string, record: Product) => (
        <div className="flex items-center justify-end gap-1">
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
