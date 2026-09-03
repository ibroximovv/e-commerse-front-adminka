import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { MyPagination } from 'dgz-ui-shared/components/pagination'
import { useDocumentTitle } from 'dgz-ui-shared/hooks'
import { LayoutGrid, List, Package, Plus, Archive } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
import { NativeSelect, SearchInput } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { toPagination } from '@/lib/api'
import type { Product, ProductSortPreset } from '@/lib/types'
import { cn, errorMessage } from '@/lib/utils'
import { useAllCategories } from '@/features/categories/hooks'

/** Filtr paneli uchun yoqib/o'chiriladigan chip. */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-brand bg-brand-muted text-brand'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function ProductsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('product.title'))

  // Katalog tekis — oddiy ro'yxat, rekursiv render kerak emas
  const { data: categoriesData } = useAllCategories({ include_archived: false })
  const categories = categoriesData ?? []

  // View mode switcher: grid vs list
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
    <div className="space-y-5">
      <PageHeader
        title={t('product.title')}
        description={t('product.subtitle')}
        actions={
          <Button onClick={handleOpenAddModal} className="rounded-lg font-medium text-xs">
            <Plus className="size-3.5 mr-1" aria-hidden />
            {t('product.addProduct')}
          </Button>
        }
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Qidiruv uchala tilda ishlaydi — ruscha so'rov uz interfeysda ham topadi */}
          <SearchInput
            value={filters.search ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            placeholder={t('product.searchPlaceholder')}
            aria-label={t('product.searchPlaceholder')}
            wrapperClassName="flex-1"
          />

          <Segmented<'grid' | 'list'>
            value={viewMode}
            onChange={toggleViewMode}
            className="self-end sm:self-auto"
            options={[
              {
                value: 'grid',
                label: <LayoutGrid className="size-3.5" aria-hidden />,
              },
              { value: 'list', label: <List className="size-3.5" aria-hidden /> },
            ]}
          />
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
          {/* Category Select */}
          <NativeSelect
            value={filters.category_id ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-8 w-auto min-w-[130px] text-xs"
          >
            <option value="">{t('common.all')} {t('product.category')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </NativeSelect>

          {/* Stock Availability Filter */}
          <NativeSelect
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
            className="h-8 w-auto min-w-[130px] text-xs"
          >
            <option value="all">{t('search.filterStockStatus')}: {t('common.all')}</option>
            <option value="in_stock">{t('dashboard.inStockProducts')}</option>
            <option value="out_of_stock">{t('dashboard.outOfStockProducts')}</option>
          </NativeSelect>

          {/* Preset Sort Select */}
          <NativeSelect
            value={filters.sort ?? 'relevance'}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as ProductSortPreset,
                page: 1,
              }))
            }}
            className="h-8 w-auto min-w-[130px] text-xs"
          >
            <option value="relevance">{t('product.sortRelevance')}</option>
            <option value="newest">{t('product.sortNewest')}</option>
            <option value="name_asc">{t('product.sortByName')}</option>
            <option value="price_asc">{t('product.sortPriceAsc')}</option>
            <option value="price_desc">{t('product.sortPriceDesc')}</option>
            <option value="popular">{t('product.sortPopular')}</option>
            <option value="top_rated">{t('product.sortTopRated')}</option>
            <option value="discount">{t('product.sortDiscount')}</option>
          </NativeSelect>

          {/* Quick Flag Toggles */}
          <FilterChip
            active={!!filters.is_top}
            onClick={() =>
              setFilters((prev) => ({ ...prev, is_top: prev.is_top ? undefined : true, page: 1 }))
            }
          >
            {t('product.isTop')}
          </FilterChip>

          <FilterChip
            active={!!filters.is_featured}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                is_featured: prev.is_featured ? undefined : true,
                page: 1,
              }))
            }
          >
            {t('product.isFeatured')}
          </FilterChip>

          {/*
            Katalogdagi mahsulotlarning ko'pi narxsiz kelgan (`price_on_request`)
            — admin ularni topib narx qo'ymaguncha savat ishlamaydi.
          */}
          <FilterChip
            active={!!filters.price_on_request}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                price_on_request: prev.price_on_request ? undefined : true,
                page: 1,
              }))
            }
          >
            {t('product.priceOnRequestShort')}
          </FilterChip>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-xs">
          <span className="font-medium text-foreground">{selectedIds.length} {t('product.selectedCount')}</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => handleBulkArchive(true)}
            >
              <Archive className="size-3 mr-1" />
              {t('category.archive')} ({selectedIds.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs"
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
          <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-border p-3.5 bg-card">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={handleOpenAddModal} className="rounded-lg text-xs">
                <Plus className="size-3.5 mr-1" aria-hidden />
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
        <div className="space-y-5">
          <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="flex items-center justify-center pt-3">
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

      {/* Modals */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />

      <StockModal
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false)
          setSelectedStockProduct(null)
        }}
        product={selectedStockProduct}
      />

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
