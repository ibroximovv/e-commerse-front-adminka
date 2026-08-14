import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Edit, Trash2 } from 'lucide-react'
import { RoleBadge } from '@/components/ui/StatusBadge'
import { fileUrl } from '@/lib/api'
import type { Language, Role, User } from '@/lib/types'
import { formatDate, initials } from '@/lib/utils'

interface ColumnCallbacks {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  /** Joriy admin o'zini o'chira olmasligi uchun. */
  currentUserId?: string
  t: (key: string) => string
}

export function getUserColumns({
  onEdit,
  onDelete,
  currentUserId,
  t,
}: ColumnCallbacks): ColumnType<User>[] {
  return [
    {
      key: 'user',
      dataIndex: 'full_name',
      name: t('user.name'),
      sortable: true,
      render: (_: string | undefined, record: User) => (
        <div className="flex items-center gap-2.5">
          {record.photo ? (
            <img
              src={fileUrl(record.photo)}
              alt=""
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
              {initials(record.full_name, record.email)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {record.full_name || t('user.noName')}
            </p>
            <p className="truncate text-xs text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      dataIndex: 'phone',
      name: t('user.phone'),
      render: (val?: string) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'role',
      dataIndex: 'role',
      name: t('user.role'),
      sortable: true,
      render: (val: Role) => <RoleBadge role={val} />,
    },
    {
      key: 'is_verified',
      dataIndex: 'is_verified',
      name: t('user.verification'),
      sortable: true,
      render: (val: boolean) => (
        <Badge type="status" variant={val ? 'green' : 'orange'} rounded="full">
          {val ? t('profile.verified') : t('profile.notVerified')}
        </Badge>
      ),
    },
    {
      key: 'language',
      dataIndex: 'language',
      name: t('user.language'),
      render: (val: Language) => (
        <span className="text-xs uppercase text-muted-foreground">{val}</span>
      ),
    },
    {
      key: 'created_at',
      dataIndex: 'created_at',
      name: t('user.registered'),
      sortable: true,
      render: (val: string) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(val)}
        </span>
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
      render: (_: string, record: User) => {
        const isSelf = record.id === currentUserId

        return (
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
              disabled={isSelf}
              onClick={() => onDelete(record)}
              title={isSelf ? t('user.cannotDeleteSelf') : t('common.delete')}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
