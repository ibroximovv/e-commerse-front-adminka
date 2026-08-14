import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useConfirm, useDocumentTitle } from 'dgz-ui-shared/hooks'
import { RotateCcw, Search, Users as UsersIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getUserColumns } from '../components/columns'
import { UserModal } from '../components/UserModal'
import { useUserMutations, useUsers } from '../hooks'
import { DEFAULT_USER_FILTERS } from '../types'
import type { UserFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { useProfile } from '@/features/auth/hooks'
import { paginateLocal } from '@/lib/api'
import type { Role, User } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

export function UsersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('user.title'))

  const { confirm } = useConfirm()
  const { data: profile } = useProfile()
  const { data, isLoading, isError, error, refetch } = useUsers()
  const { remove } = useUserMutations()

  /* Buyurtma detalidan "mijozni ko'rish" havolasi `?search=` bilan keladi. */
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<UserFilters>(() => ({
    ...DEFAULT_USER_FILTERS,
    search: searchParams.get('search') ?? '',
  }))
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const rawUsers = data?.items
  const users = useMemo(() => rawUsers ?? [], [rawUsers])

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()

    return users.filter((user) => {
      if (filters.role !== 'ALL' && user.role !== filters.role) return false
      if (filters.verified === 'VERIFIED' && !user.is_verified) return false
      if (filters.verified === 'UNVERIFIED' && user.is_verified) return false

      if (query) {
        const haystack = [user.full_name, user.email, user.phone]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }

      return true
    })
  }, [users, filters])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleDelete = (user: User) => {
    confirm({
      onConfirm: () => {
        remove.mutate(user.id, {
          onSuccess: () => toast.success(t('user.deletedSuccess')),
          onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
        })
      },
    })
  }

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        currentUserId: profile?.id,
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, profile?.id],
  )

  const setFilter = <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const isFiltered =
    filters.search !== '' || filters.role !== 'ALL' || filters.verified !== 'ALL'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('user.title')} description={t('user.subtitle')} />
        <TableSkeleton rows={6} columns={6} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('user.title')}
        description={t('user.subtitle')}
        actions={
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {t('user.totalCount', { value: users.length })}
          </span>
        }
      />

      {/* Rolni o'zgartirib bo'lmasligi — kutilmagan hol, sahifada ochiq aytiladi */}
      <p className="rounded-lg border border-info/30 bg-info-muted px-4 py-2.5 text-xs text-info">
        {t('user.roleNotice')}
      </p>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t('user.searchPlaceholder')}
            aria-label={t('user.searchPlaceholder')}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value as Role | 'ALL')}
            aria-label={t('user.role')}
            className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">{t('user.allRoles')}</option>
            <option value="ADMIN">{t('role.ADMIN')}</option>
            <option value="USER">{t('role.USER')}</option>
          </select>

          <select
            value={filters.verified}
            onChange={(e) =>
              setFilter('verified', e.target.value as UserFilters['verified'])
            }
            aria-label={t('user.verification')}
            className="h-9 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">{t('user.allVerification')}</option>
            <option value="VERIFIED">{t('profile.verified')}</option>
            <option value="UNVERIFIED">{t('profile.notVerified')}</option>
          </select>

          {isFiltered ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilters(DEFAULT_USER_FILTERS)
                setPage(1)
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              {t('common.reset')}
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState
            icon={<UsersIcon className="size-10 text-muted-foreground" />}
            title={isFiltered ? t('user.noMatches') : t('user.empty')}
            description={isFiltered ? t('user.noMatchesHint') : t('user.emptyHint')}
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilters(DEFAULT_USER_FILTERS)
                    setPage(1)
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  {t('common.reset')}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <DataTable<User>
          tableKey="users-table"
          rowKey="id"
          columns={columns}
          /* Backendda sahifalash yo'q — kesish mijoz tomonda. */
          dataSource={paginateLocal(filtered, page, limit)}
          onParamChange={(params: Record<string, unknown>) => {
            if (typeof params.page === 'number' && params.page !== page) {
              setPage(params.page)
            }
            if (typeof params.limit === 'number' && params.limit !== limit) {
              setLimit(params.limit)
              setPage(1)
            }
          }}
          hasPagination
          hasColumnsVisibilityDropdown
        />
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
        user={editingUser}
      />
    </div>
  )
}
