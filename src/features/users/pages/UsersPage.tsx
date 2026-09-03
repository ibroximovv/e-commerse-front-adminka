import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { RotateCcw, Users as UsersIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getUserColumns } from '../components/columns'
import { UserModal } from '../components/UserModal'
import { useUserMutations, useUsers, useUserStats } from '../hooks'
import { DEFAULT_USER_FILTERS } from '../types'
import type { UserFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { NativeSelect, SearchInput } from '@/components/ui/Field'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
import { useProfile } from '@/features/auth/hooks'
import { paginateLocal, toPagination } from '@/lib/api'
import type { Role, User } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

export function UsersPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('user.title'))

  const { data: profile } = useProfile()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<UserFilters>(() => ({
    ...DEFAULT_USER_FILTERS,
    search: searchParams.get('search') ?? '',
  }))
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data, isLoading, isError, error, refetch } = useUsers({
    page,
    limit,
    role: filters.role !== 'ALL' ? filters.role : undefined,
    search: filters.search.trim() || undefined,
  })
  const { data: userStats } = useUserStats()
  const { remove } = useUserMutations()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<(ConfirmOptions & { isOpen: boolean }) | null>(null)

  const openConfirm = (opts: ConfirmOptions) => {
    setConfirmConfig({ ...opts, isOpen: true })
  }

  const closeConfirm = () => {
    setConfirmConfig(null)
  }

  const rawUsers = data?.items
  const users = useMemo(() => rawUsers ?? [], [rawUsers])

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (filters.verified === 'VERIFIED' && !user.is_verified) return false
      if (filters.verified === 'UNVERIFIED' && user.is_verified) return false
      return true
    })
  }, [users, filters.verified])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleDelete = (user: User) => {
    openConfirm({
      title: t('common.delete'),
      description: `${user.full_name || user.email}`,
      confirmText: t('common.delete'),
      iconType: 'delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await remove.mutateAsync(user.id)
          toast.success(t('user.deletedSuccess'))
        } catch (err) {
          toast.error(errorMessage(err, t('error.generic')))
        }
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
      <div className="space-y-5">
        <PageHeader title={t('user.title')} description={t('user.subtitle')} />
        <TableSkeleton rows={6} columns={6} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  const totalCount = userStats?.total_users ?? data?.meta?.total ?? users.length
  const verifiedCount = userStats?.verified_users

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('user.title')}
        description={t('user.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            {verifiedCount !== undefined && (
              <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t('profile.verified')}: {verifiedCount}
              </span>
            )}
            <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {t('user.totalCount', { value: totalCount })}
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder={t('user.searchPlaceholder')}
          aria-label={t('user.searchPlaceholder')}
          wrapperClassName="lg:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value as Role | 'ALL')}
            aria-label={t('user.role')}
            className="w-auto min-w-[120px]"
          >
            <option value="ALL">{t('user.allRoles')}</option>
            <option value="ADMIN">{t('role.ADMIN')}</option>
            <option value="USER">{t('role.USER')}</option>
          </NativeSelect>

          <NativeSelect
            value={filters.verified}
            onChange={(e) =>
              setFilter('verified', e.target.value as UserFilters['verified'])
            }
            aria-label={t('user.verification')}
            className="w-auto min-w-[130px]"
          >
            <option value="ALL">{t('user.allVerification')}</option>
            <option value="VERIFIED">{t('profile.verified')}</option>
            <option value="UNVERIFIED">{t('profile.notVerified')}</option>
          </NativeSelect>

          {isFiltered ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => {
                setFilters(DEFAULT_USER_FILTERS)
                setPage(1)
              }}
            >
              <RotateCcw className="size-3 mr-1" aria-hidden />
              {t('common.reset')}
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            icon={<UsersIcon className="size-8 text-muted-foreground" />}
            title={isFiltered ? t('user.noMatches') : t('user.empty')}
            description={isFiltered ? t('user.noMatchesHint') : t('user.emptyHint')}
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  className="rounded-lg text-xs"
                  onClick={() => {
                    setFilters(DEFAULT_USER_FILTERS)
                    setPage(1)
                  }}
                >
                  <RotateCcw className="size-3.5 mr-1" aria-hidden />
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
          dataSource={data?.meta ? toPagination(filtered, data.meta) : paginateLocal(filtered, page, limit)}
          onParamChange={(params: Record<string, unknown>) => {
            if (typeof params.page === 'number' && params.page !== page) {
              setPage(params.page)
            }
            if (typeof params.limit === 'number' && params.limit !== limit) {
              setLimit(params.limit)
              setPage(1)
            }
          }}
          hasNumbers
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

      {confirmConfig && (
        <ConfirmModal
          {...confirmConfig}
          onClose={closeConfirm}
        />
      )}
    </div>
  )
}
