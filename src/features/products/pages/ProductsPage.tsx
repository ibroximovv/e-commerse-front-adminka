import { Button } from 'dgz-ui/button'
import { DataTable } from 'dgz-ui-shared/components/datatable'
import { MyPagination } from 'dgz-ui-shared/components/pagination'
import { useConfirm, useDocumentTitle } from 'dgz-ui-shared/hooks'
import { LayoutGrid, List, Package, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { getProductColumns } from '../components/columns'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { useProductMutations, useProducts } from '../hooks'
import type { ProductFilters } from '../types'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from '@/components/ui/States'
import { toPagination } from '@/lib/api'
import type { Product } from '@/lib/types'
import { errorMessage } from '@/lib/utils'
import { useCategories } from '@/features/categories/hooks'

export function ProductsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('product.title'))

  const { confirm } = useConfirm()
  const { data: categoriesData } = useCategories(true)
  const categories = categoriesData?.items ?? []

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
    sortBy: 'created_at',
    sortOrder: 'desc',
    includeArchived: false,
  })

  const { data, isLoading, isError, error, refetch } = useProducts(filters)
  const { setArchived, remove } = useProductMutations()

  const products = data?.items ?? []
  const meta = data?.meta

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleToggleArchive = (product: Product) => {
    const isArchiving = !product.is_archived
    confirm({
      onConfirm: () => {
        setArchived.mutate(
          { id: product.id, is_archived: isArchiving },
          {
            onSuccess: () => {
              toast.success(
                isArchiving
                  ? t('product.archivedSuccess')
                  : t('product.unarchivedSuccess'),
              )
            },
            onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
          },
        )
      },
    })
  }

  const handleDelete = (product: Product) => {
    confirm({
      onConfirm: () => {
        remove.mutate(product.id, {
          onSuccess: () => toast.success(t('product.deletedSuccess')),
          onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
        })
      },
    })
  }

  const columns = useMemo(
    () =>
      getProductColumns({
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
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              placeholder={t('common.search')}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">{t('product.allStatus') ? t('common.all') + ' ' + t('product.category') : t('product.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sorting Select */}
            <select
              value={`${filters.sortBy ?? 'created_at'}_${filters.sortOrder ?? 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_') as [
                  ProductFilters['sortBy'],
                  ProductFilters['sortOrder'],
                ]
                setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }))
              }}
              className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="created_at_desc">{t('product.sortByNewest')}</option>
              <option value="name_asc">{t('product.sortByName')} (A-Z)</option>
              <option value="name_desc">{t('product.sortByName')} (Z-A)</option>
              <option value="price_asc">{t('product.sortByPriceAsc')}</option>
              <option value="price_desc">{t('product.sortByPriceDesc')}</option>
              <option value="stock_desc">{t('product.sortByStock')}</option>
            </select>

            {/* Include Archived Checkbox */}
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={filters.includeArchived ?? false}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    includeArchived: e.target.checked,
                    page: 1,
                  }))
                }
                className="size-4 rounded border-input text-brand focus:ring-ring"
              />
              {t('category.archived')}
            </label>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => toggleViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${
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
                className={`rounded-md p-1.5 transition-colors ${
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
      </div>

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

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />
    </div>
  )
}
