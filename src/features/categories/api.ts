import { del, get, getList, getRaw, patch, post } from '@/lib/api'
import type { Category, CategoryRaw } from '@/lib/types'
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

  /**
   * Sahifalashsiz to'liq ro'yxat — selectlar va menyu uchun.
   * Avvalgi `/tree` ning o'rnini bosadi: katalog tekis, javob `sort_order`
   * bo'yicha tartiblangan, rekursiv render kerak emas.
   */
  all: (params?: { with_product_count?: boolean; include_archived?: boolean }) =>
    get<Category[]>('/api/categories/all', params),

  byId: (id: string) => get<Category>(`/api/categories/${id}`),

  /** Tahrirlash formasi uchun: `name_uz`/`name_ru`/`name_en` bilan. */
  byIdRaw: (id: string) => getRaw<CategoryRaw>(`/api/categories/${id}`),

  create: (body: CategoryInput) => post<Category>('/api/categories', body),

  update: (id: string, body: CategoryUpdateInput) =>
    patch<Category>(`/api/categories/${id}`, body),

  setArchived: (id: string, is_archived: boolean) =>
    patch<Category>(`/api/categories/${id}`, { is_archived }),

  remove: (id: string) => del<Category>(`/api/categories/${id}`),
}
