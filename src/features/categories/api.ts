import { del, get, getList, patch, post } from '@/lib/api'
import type { Category, CategoryBreadcrumb } from '@/lib/types'
import type { CategoryFilters, CategoryInput, CategoryUpdateInput } from './types'

export const categoriesApi = {
  list: (filters: CategoryFilters = {}) => {
    const { archivedStatus, include_archived, ...rest } = filters
    const queryParams: Record<string, unknown> = { ...rest }

    if (include_archived || archivedStatus === 'archived' || archivedStatus === 'all') {
      queryParams.include_archived = true
    }

    return getList<Category>('/api/categories', queryParams)
  },

  tree: (params?: {
    with_product_count?: boolean
    root_id?: string
    include_archived?: boolean
  }) => get<Category[]>('/api/categories/tree', params),

  byId: (id: string) => get<Category>(`/api/categories/${id}`),

  bySlug: (slug: string) => get<Category>(`/api/categories/slug/${slug}`),

  breadcrumbs: (id: string) => get<CategoryBreadcrumb[]>(`/api/categories/${id}/breadcrumbs`),

  create: (body: CategoryInput) => post<Category>('/api/categories', body),

  update: (id: string, body: CategoryUpdateInput) =>
    patch<Category>(`/api/categories/${id}`, body),

  setArchived: (id: string, is_archived: boolean) =>
    patch<Category>(`/api/categories/${id}`, { is_archived }),

  remove: (id: string) => del<Category>(`/api/categories/${id}`),
}
