import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useConfirm, useDocumentTitle } from 'dgz-ui-shared/hooks'
import { Plus, Search, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { CategoryModal } from '../components/CategoryModal'
import { getCategoryColumns } from '../components/columns'
import { useCategories, useCategoryMutations } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { toPagination } from '@/lib/api'
import type { Category } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

export function CategoriesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('category.title'))

  const { confirm } = useConfirm()
  const { data, isLoading, isError, error, refetch } = useCategories(true)
  const { setArchived, remove } = useCategoryMutations()

  const rawCategories = data?.items
  const categories = useMemo(() => rawCategories ?? [], [rawCategories])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      // Status filter
      if (statusFilter === 'active' && category.is_archived) return false
      if (statusFilter === 'archived' && !category.is_archived) return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = category.name.toLowerCase().includes(q)
        const matchDesc = category.description?.toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }

      return true
    })
  }, [categories, statusFilter, searchQuery])

  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleToggleArchive = (category: Category) => {
    const isArchiving = !category.is_archived
    confirm({
      onConfirm: () => {
        setArchived.mutate(
          { id: category.id, is_archived: isArchiving },
          {
            onSuccess: () => {
              toast.success(
                isArchiving
                  ? t('category.archivedSuccess')
                  : t('category.unarchivedSuccess'),
              )
            },
            onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
          },
        )
      },
    })
  }

  const handleDelete = (category: Category) => {
    confirm({
      onConfirm: () => {
        remove.mutate(category.id, {
          onSuccess: () => toast.success(t('category.deletedSuccess')),
          onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
        })
      },
    })
  }

  const columns = useMemo(
    () =>
      getCategoryColumns({
        onEdit: handleOpenEditModal,
        onToggleArchive: handleToggleArchive,
        onDelete: handleDelete,
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('category.title')} description={t('category.subtitle')} />
        <TableSkeleton rows={5} columns={5} />
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('category.title')}
        description={t('category.subtitle')}
        actions={
          <Button onClick={handleOpenAddModal}>
            <Plus className="size-4" aria-hidden />
            {t('category.addCategory')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filter tabs */}
        <div className="flex items-center rounded-lg border border-border bg-background p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-brand text-brand-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('category.allStatus')} ({categories.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-brand text-brand-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('category.activeOnly')} (
            {categories.filter((c) => !c.is_archived).length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              statusFilter === 'archived'
                ? 'bg-brand text-brand-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('category.archivedOnly')} (
            {categories.filter((c) => c.is_archived).length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState
            icon={<Tags className="size-10 text-muted-foreground" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              categories.length === 0 ? (
                <Button onClick={handleOpenAddModal}>
                  <Plus className="size-4" aria-hidden />
                  {t('category.addCategory')}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <DataTable<Category>
          tableKey="categories-table"
          rowKey="id"
          columns={columns}
          dataSource={toPagination(filteredCategories)}
          hasPagination
          hasColumnsVisibilityDropdown
        />
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        existingCategories={categories}
      />
    </div>
  )
}
