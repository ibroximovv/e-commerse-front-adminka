import { Button } from 'dgz-ui/button'
import type { ColumnType } from 'dgz-ui-shared/types'
import { Edit, Trash2 } from 'lucide-react'
import { RoleBadge } from '@/components/ui/StatusBadge'
import { fileUrl } from '@/lib/api'
import { formatPhone } from '@/lib/phone'
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
              className="size-8.5 shrink-0 rounded-xl object-cover border border-border/40"
            />
          ) : (
            <span className="flex size-8.5 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-brand/10 text-xs font-bold text-brand">
              {initials(record.full_name)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {record.full_name || t('user.noName')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      dataIndex: 'phone',
      name: t('user.phone'),
      sortable: true,
      render: (val: string | null) => (
        <span className="whitespace-nowrap font-mono text-xs text-foreground">
          {val ? formatPhone(val) : '—'}
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
      key: 'language',
      dataIndex: 'language',
      name: t('user.language'),
      render: (val: Language) => (
        <span className="rounded-md border border-border/40 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-muted-foreground">
          {val}
        </span>
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
              className="rounded-lg size-8"
            >
              <Edit className="size-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isSelf}
              onClick={() => onDelete(record)}
              title={isSelf ? t('user.cannotDeleteSelf') : t('common.delete')}
              className="rounded-lg size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )
      },
    },
  ]
}

