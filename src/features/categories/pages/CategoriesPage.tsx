import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { Plus, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { CategoryModal } from '../components/CategoryModal'
import { getCategoryColumns } from '../components/columns'
import { useCategories, useCategoryMutations } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
import { SearchInput } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { toPagination } from '@/lib/api'
import type { Category } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

type StatusFilter = 'all' | 'active' | 'archived'

export function CategoriesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('category.title'))

  /*
   * Katalog tekis va 8 ta bo'limdan iborat — sahifalash amalda kerak emas,
   * shuning uchun hammasini bir marta olib, filtrlashni mijozda qilamiz.
   */
  const { data, isLoading, isError, error, refetch } = useCategories({
    include_archived: true,
    with_product_count: true,
    limit: 100,
  })
  const { setArchived, remove } = useCategoryMutations()

  const categories = useMemo(() => data?.items ?? [], [data?.items])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [confirmConfig, setConfirmConfig] = useState<
    (ConfirmOptions & { isOpen: boolean }) | null
  >(null)

  const openConfirm = (opts: ConfirmOptions) => setConfirmConfig({ ...opts, isOpen: true })
  const closeConfirm = () => setConfirmConfig(null)

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return categories.filter((category) => {
      if (statusFilter === 'active' && category.is_archived) return false
      if (statusFilter === 'archived' && !category.is_archived) return false

      if (q) {
        const haystack = [category.name, category.slug, category.description]
        if (!haystack.some((field) => field?.toLowerCase().includes(q))) return false
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
    openConfirm({
      title: isArchiving ? t('category.confirmArchive') : t('category.confirmUnarchive'),
      // Arxivlanganda ichidagi mahsulotlar ham arxivlanadi — buni aytib qo'yamiz
      description: isArchiving
        ? t('category.archiveCascadeHint', { count: category.product_count ?? 0 })
        : `${category.name} (/${category.slug})`,
      confirmText: isArchiving ? t('category.archive') : t('category.unarchive'),
      iconType: 'archive',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await setArchived.mutateAsync({ id: category.id, is_archived: isArchiving })
          toast.success(
            isArchiving ? t('category.archivedSuccess') : t('category.unarchivedSuccess'),
          )
        } catch (err) {
          toast.error(errorMessage(err, t('error.generic')))
        }
      },
    })
  }

  const handleDelete = (category: Category) => {
    openConfirm({
      title: t('category.confirmDelete'),
      description: category.name,
      confirmText: t('common.delete'),
      iconType: 'delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await remove.mutateAsync(category.id)
          toast.success(t('category.deletedSuccess'))
        } catch (err) {
          // Mahsuloti bor kategoriya o'chirilmaydi (400) — backend sababni aytadi
          toast.error(errorMessage(err, t('error.generic')))
        }
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

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-5">
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

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel={t('category.status')}
          options={[
            { value: 'all', label: t('category.allStatus'), count: categories.length },
            {
              value: 'active',
              label: t('category.activeOnly'),
              count: categories.filter((c) => !c.is_archived).length,
            },
            {
              value: 'archived',
              label: t('category.archivedOnly'),
              count: categories.filter((c) => c.is_archived).length,
            },
          ]}
        />

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          wrapperClassName="sm:w-64"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            icon={<Tags className="size-8 text-muted-foreground" />}
            title={categories.length === 0 ? t('empty.title') : t('category.noMatches')}
            description={
              categories.length === 0 ? t('category.emptyHint') : t('empty.description')
            }
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
          hasNumbers
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
      />

      {confirmConfig && <ConfirmModal {...confirmConfig} onClose={closeConfirm} />}
    </div>
  )
}
