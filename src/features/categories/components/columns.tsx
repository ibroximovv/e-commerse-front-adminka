import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Archive, ArchiveRestore, Edit, Folder, Trash2 } from 'lucide-react'
import { fileUrl } from '@/lib/api'
import type { Category } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface ColumnCallbacks {
  onEdit: (category: Category) => void
  onToggleArchive: (category: Category) => void
  onDelete: (category: Category) => void
  t: (key: string) => string
}

export function getCategoryColumns({
  onEdit,
  onToggleArchive,
  onDelete,
  t,
}: ColumnCallbacks): ColumnType<Category>[] {
  return [
    {
      key: 'image',
      dataIndex: 'image',
      name: '',
      render: (_: unknown, record: Category) => (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
          {record.image ? (
            <img
              src={fileUrl(record.image)}
              alt={record.name}
              className="size-full object-cover"
            />
          ) : (
            <Folder className="size-5 text-muted-foreground/60" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      dataIndex: 'name',
      name: t('category.name'),
      sortable: true,
      render: (val: string, record: Category) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{val}</span>
            {record.is_featured && (
              <Badge type="status" variant="blue" rounded="full">
                {t('category.featured')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] text-muted-foreground/80">/{record.slug}</span>
            {record.description ? (
              <span className="line-clamp-1">— {record.description}</span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'product_count',
      dataIndex: 'product_count',
      name: t('category.productCount'),
      sortable: true,
      render: (val: number | undefined) => (
        <span className="font-medium text-foreground">{val ?? 0}</span>
      ),
    },
    {
      key: 'sort_order',
      dataIndex: 'sort_order',
      name: t('category.sortOrder'),
      sortable: true,
      render: (val: number | undefined) => (
        <span className="text-xs font-mono text-muted-foreground">{val ?? 0}</span>
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
      key: 'created_at',
      dataIndex: 'created_at',
      name: t('dashboard.date'),
      sortable: true,
      render: (val: string) => (
        <span className="text-xs text-muted-foreground">{formatDate(val)}</span>
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
      render: (_: string, record: Category) => (
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
