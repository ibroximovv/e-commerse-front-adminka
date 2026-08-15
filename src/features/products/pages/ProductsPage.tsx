import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { MyPagination } from 'dgz-ui-shared/components/pagination'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { Flame, LayoutGrid, List, Package, Plus, Search, Sparkles, Archive } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { getProductColumns } from '../components/columns'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { StockModal } from '../components/StockModal'
import { ProductReviewsModal } from '../components/ProductReviewsModal'
import { useProductMutations, useProducts } from '../hooks'
import type { ProductFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from '@/components/ui/States'
import { ConfirmModal, type ConfirmOptions } from '@/components/ui/ConfirmModal'
import { toPagination } from '@/lib/api'
import type { Product, ProductSortPreset } from '@/lib/types'
import { errorMessage } from '@/lib/utils'
import { useCategoryTree } from '@/features/categories/hooks'

export function ProductsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('product.title'))

  const { data: treeData } = useCategoryTree({ include_archived: false })
  const categoryTree = treeData ?? []

  // View mode switcher: grid vs list (stored in localStorage)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('products_view_mode') as 'grid' | 'list') || 'grid'
  })

  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('products_view_mode', mode)
  }

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    search: '',
    category_id: '',
    sort: 'relevance',
    includeArchived: false,
    with_facets: true,
  })

  const { data, isLoading, isError, error, refetch } = useProducts(filters)
  const { setArchived, updateFlags, bulkArchive, remove } = useProductMutations()

  const products = data?.items ?? []
  const meta = data?.meta

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Stock adjustment modal state
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null)

  // Reviews modal state
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [selectedReviewsProduct, setSelectedReviewsProduct] = useState<Product | null>(null)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleOpenStockModal = (product: Product) => {
    setSelectedStockProduct(product)
    setStockModalOpen(true)
  }

  const handleOpenReviewsModal = (product: Product) => {
    setSelectedReviewsProduct(product)
    setReviewsModalOpen(true)
  }
  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState<(ConfirmOptions & { isOpen: boolean }) | null>(null)

  const openConfirm = (opts: ConfirmOptions) => {
    setConfirmConfig({ ...opts, isOpen: true })
  }

  const closeConfirm = () => {
    setConfirmConfig(null)
  }

  const handleToggleTop = (product: Product) => {
    updateFlags.mutate(
      { id: product.id, flags: { is_top: !product.is_top } },
      {
        onSuccess: () => {
          toast.success(!product.is_top ? t('product.markedAsTop') : t('product.unmarkedAsTop'))
        },
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
      },
    )
  }

  const handleToggleFeatured = (product: Product) => {
    updateFlags.mutate(
      { id: product.id, flags: { is_featured: !product.is_featured } },
      {
        onSuccess: () => {
          toast.success(!product.is_featured ? t('product.markedAsFeatured') : t('product.unmarkedAsFeatured'))
        },
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
      },
    )
  }

  const handleToggleArchive = (product: Product) => {
    const isArchiving = !product.is_archived
    openConfirm({
      title: isArchiving ? t('product.confirmArchive') : t('product.confirmUnarchive'),
      description: `${product.name} (${product.sku || product.slug || ''})`,
      confirmText: isArchiving ? t('product.archivedSuccess').replace('Mahsulot ', '').replace('Товар ', '') : t('product.unarchivedSuccess').replace('Mahsulot ', '').replace('Товар ', ''),
      iconType: 'archive',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await setArchived.mutateAsync({ id: product.id, is_archived: isArchiving })
          toast.success(
            isArchiving
              ? t('product.archivedSuccess')
              : t('product.unarchivedSuccess'),
          )
        } catch (err) {
          toast.error(errorMessage(err, t('error.generic')))
        }
      },
    })
  }

  const handleDelete = (product: Product) => {
    openConfirm({
      title: t('product.confirmDelete'),
      description: product.name,
      confirmText: t('common.delete'),
      iconType: 'delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await remove.mutateAsync(product.id)
          toast.success(t('product.deletedSuccess'))
        } catch (err) {
          toast.error(errorMessage(err, t('error.generic')))
        }
      },
    })
  }

  const handleBulkArchive = (archiveState: boolean) => {
    if (selectedIds.length === 0) return
    openConfirm({
      title: t('product.confirmArchive'),
      description: `${selectedIds.length} ${t('product.selectedCount')}`,
      confirmText: t('category.archive'),
      iconType: 'archive',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await bulkArchive.mutateAsync({ ids: selectedIds, is_archived: archiveState })
          toast.success(`${t('product.bulkArchiveSuccess')} (${res.updated})`)
          setSelectedIds([])
        } catch (err) {
          toast.error(errorMessage(err, t('error.generic')))
        }
      },
    })
  }

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: handleOpenEditModal,
        onToggleArchive: handleToggleArchive,
        onToggleTop: handleToggleTop,
        onToggleFeatured: handleToggleFeatured,
        onUpdateStock: handleOpenStockModal,
        onViewReviews: handleOpenReviewsModal,
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
    <div className="space-y-6">
      <PageHeader
        title={t('product.title')}
        description={t('product.subtitle')}
        actions={
          <Button onClick={handleOpenAddModal}>
            <Plus className="size-4" aria-hidden />
            {t('product.addProduct')}
          </Button>
        }
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              placeholder={t('common.search')}
              className="h-10 w-full rounded-xl border border-input bg-card/60 pl-9 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center rounded-xl border border-border/40 bg-card/40 p-1">
              <button
                type="button"
                onClick={() => toggleViewMode('grid')}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-brand text-brand-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('product.viewGrid')}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleViewMode('list')}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand text-brand-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={t('product.viewList')}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns & Flag Toggles Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border/30">
          {/* Category Select */}
          <select
            value={filters.category_id ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-9 min-w-[140px] flex-1 sm:flex-initial rounded-xl border border-input bg-card/60 px-3 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t('common.all')} {t('product.category')}</option>
            {categoryTree.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Availability Filter */}
          <select
            value={
              filters.in_stock === false
                ? 'out_of_stock'
                : filters.in_stock === true
                ? 'in_stock'
                : 'all'
            }
            onChange={(e) => {
              const val = e.target.value
              setFilters((prev) => ({
                ...prev,
                in_stock: val === 'in_stock' ? true : val === 'out_of_stock' ? false : undefined,
                page: 1,
              }))
            }}
            className="h-9 min-w-[140px] flex-1 sm:flex-initial rounded-xl border border-input bg-card/60 px-3 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">{t('search.filterStockStatus')}: {t('common.all')}</option>
            <option value="in_stock">{t('dashboard.inStockProducts')}</option>
            <option value="out_of_stock">{t('dashboard.outOfStockProducts')}</option>
          </select>

          {/* Preset Sort Select */}
          <select
            value={filters.sort ?? 'relevance'}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as ProductSortPreset,
                page: 1,
              }))
            }}
            className="h-9 min-w-[150px] flex-1 sm:flex-initial rounded-xl border border-input bg-card/60 px-3 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="relevance">{t('product.sortRelevance')}</option>
            <option value="newest">{t('product.sortNewest')}</option>
            <option value="price_asc">{t('product.sortPriceAsc')}</option>
            <option value="price_desc">{t('product.sortPriceDesc')}</option>
            <option value="popular">{t('product.sortPopular')}</option>
            <option value="top_rated">{t('product.sortTopRated')}</option>
            <option value="discount">{t('product.sortDiscount')}</option>
          </select>

          {/* Quick Flag Toggles */}
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                is_top: prev.is_top ? undefined : true,
                page: 1,
              }))
            }
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filters.is_top
                ? 'bg-amber-500 text-white shadow-xs'
                : 'border border-border/40 bg-card/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="size-3.5" /> TOP
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                is_featured: prev.is_featured ? undefined : true,
                page: 1,
              }))
            }
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filters.is_featured
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-border/40 bg-card/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="size-3.5" /> Featured
          </button>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-brand/40 bg-brand-muted p-3 text-xs text-brand">
          <span>{selectedIds.length} {t('product.selectedCount')}</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleBulkArchive(true)}
            >
              <Archive className="size-3.5 mr-1" />
              {t('category.archive')} ({selectedIds.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        viewMode === 'list' ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <EmptyState
            icon={<Package className="size-10 text-muted-foreground" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={handleOpenAddModal}>
                <Plus className="size-4" aria-hidden />
                {t('product.addProduct')}
              </Button>
            }
          />
        </div>
      ) : viewMode === 'list' ? (
        <DataTable<Product>
          tableKey="products-table"
          rowKey="id"
          columns={columns}
          dataSource={toPagination(products, meta)}
          onParamChange={(params: { page?: number; limit?: number }) => {
            if (params.page && params.page !== filters.page) {
              setFilters((prev) => ({ ...prev, page: params.page }))
            }
            if (params.limit && params.limit !== filters.limit) {
              setFilters((prev) => ({ ...prev, limit: params.limit, page: 1 }))
            }
          }}
          hasNumbers
          hasPagination
          hasColumnsVisibilityDropdown
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleOpenEditModal}
                onToggleArchive={handleToggleArchive}
                onToggleTop={handleToggleTop}
                onToggleFeatured={handleToggleFeatured}
                onUpdateStock={handleOpenStockModal}
                onViewReviews={handleOpenReviewsModal}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-center pt-4">
              <MyPagination
                currentPage={filters.page ?? 1}
                totalPages={meta.totalPages}
                onPageChange={(p: number) =>
                  setFilters((prev) => ({ ...prev, page: p }))
                }
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Product Edit / Add Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />

      {/* Stock Quantity Adjustment Modal */}
      <StockModal
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false)
          setSelectedStockProduct(null)
        }}
        product={selectedStockProduct}
      />

      {/* Product Reviews & Summary Modal */}
      <ProductReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => {
          setReviewsModalOpen(false)
          setSelectedReviewsProduct(null)
        }}
        product={selectedReviewsProduct}
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
