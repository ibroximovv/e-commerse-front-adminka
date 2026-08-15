import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { ChevronRight, Folder, FolderOpen, Plus, Search, Tags, Network, List } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { CategoryModal } from '../components/CategoryModal'
import { getCategoryColumns } from '../components/columns'
import { useCategories, useCategoryMutations, useCategoryTree } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/ui/States'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
import { fileUrl, toPagination } from '@/lib/api'
import type { Category } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

function CategoryTreeNode({
  category,
  onEdit,
  onToggleArchive,
  onDelete,
  t,
}: {
  category: Category
  onEdit: (c: Category) => void
  onToggleArchive: (c: Category) => void
  onDelete: (c: Category) => void
  t: (k: string) => string
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = category.children && category.children.length > 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/80 p-3 hover:bg-muted/30 transition-all duration-150 shadow-xs">
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-muted-foreground hover:text-foreground transition-transform duration-150"
            >
              <ChevronRight
                className={`size-4 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/40 shadow-2xs">
            {category.image ? (
              <img
                src={fileUrl(category.image)}
                alt={category.name}
                className="size-full object-cover"
              />
            ) : expanded && hasChildren ? (
              <FolderOpen className="size-4 text-brand" />
            ) : (
              <Folder className="size-4 text-muted-foreground" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground tracking-tight">{category.name}</span>
              {category.is_featured && (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20">
                  {t('category.featured')}
                </span>
              )}
              {category.is_archived && (
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {t('category.archived')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono text-[11px] opacity-80">/{category.slug}</span>
              <span>
                {t('category.productCount')}: <strong className="text-foreground">{category.product_count ?? 0}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(category)} className="rounded-lg">
            {t('common.edit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleArchive(category)}
            className="rounded-lg"
          >
            {category.is_archived ? t('category.unarchive') : t('category.archive')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="rounded-lg text-destructive hover:bg-destructive/10"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 space-y-1.5 border-l-2 border-border/40 pl-3">
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              onEdit={onEdit}
              onToggleArchive={onToggleArchive}
              onDelete={onDelete}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('category.title'))

  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')

  const { data, isLoading, isError, error, refetch } = useCategories({
    include_archived: true,
    with_product_count: true,
  })
  const { data: treeData, isLoading: isTreeLoading } = useCategoryTree({
    with_product_count: true,
    include_archived: true,
  })
  const { setArchived, remove } = useCategoryMutations()

  const rawCategories = data?.items
  const categories = useMemo(() => rawCategories ?? [], [rawCategories])
  const treeCategories = useMemo(() => treeData ?? [], [treeData])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<(ConfirmOptions & { isOpen: boolean }) | null>(null)

  const openConfirm = (opts: ConfirmOptions) => {
    setConfirmConfig({ ...opts, isOpen: true })
  }

  const closeConfirm = () => {
    setConfirmConfig(null)
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      // Status filter
      if (statusFilter === 'active' && category.is_archived) return false
      if (statusFilter === 'archived' && !category.is_archived) return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = category.name.toLowerCase().includes(q)
        const matchSlug = category.slug?.toLowerCase().includes(q)
        const matchDesc = category.description?.toLowerCase().includes(q)
        if (!matchName && !matchSlug && !matchDesc) return false
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
      description: `${category.name} (${category.slug})`,
      confirmText: isArchiving ? t('category.archive') : t('category.unarchive'),
      iconType: 'archive',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await setArchived.mutateAsync({ id: category.id, is_archived: isArchiving })
          toast.success(
            isArchiving
              ? t('category.archivedSuccess')
              : t('category.unarchivedSuccess'),
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

  if (isLoading || isTreeLoading) {
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
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border/40 bg-card/60 p-1 text-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                  viewMode === 'tree'
                    ? 'bg-brand text-brand-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Network className="size-3.5" />
                {t('category.treeView')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand text-brand-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="size-3.5" />
                {t('category.listView')}
              </button>
            </div>

            <Button onClick={handleOpenAddModal} className="rounded-xl">
              <Plus className="size-4" aria-hidden />
              {t('category.addCategory')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filter tabs */}
        <div className="flex items-center rounded-xl border border-border/40 bg-card/60 p-1 text-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
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
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
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
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
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
            className="h-9 w-full rounded-xl border border-input bg-card/60 pl-8 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {viewMode === 'tree' ? (
        treeCategories.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card p-12 text-center shadow-xs">
            <EmptyState
              icon={<Tags className="size-10 text-muted-foreground" />}
              title={t('empty.title')}
              description={t('empty.description')}
              action={
                <Button onClick={handleOpenAddModal} className="rounded-xl">
                  <Plus className="size-4" aria-hidden />
                  {t('category.addCategory')}
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2">
            {treeCategories.map((treeNode) => (
              <CategoryTreeNode
                key={treeNode.id}
                category={treeNode}
                onEdit={handleOpenEditModal}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </div>
        )
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card p-12 text-center shadow-xs">
          <EmptyState
            icon={<Tags className="size-10 text-muted-foreground" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              categories.length === 0 ? (
                <Button onClick={handleOpenAddModal} className="rounded-xl">
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
        existingCategories={categories}
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
