import { del, get, getList, getRaw, patch, post } from '@/lib/api'
import type { Product, ProductFacets, ProductRaw, Review, ReviewSummary } from '@/lib/types'
import type {
  ProductFilters,
  ProductFlagsInput,
  ProductInput,
  ProductUpdateInput,
} from './types'

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const { includeArchived, ...rest } = filters
    const queryParams: Record<string, unknown> = { ...rest }

    if (includeArchived) {
      queryParams.include_archived = true
    }

    return getList<Product>('/api/products', queryParams)
  },

  byId: (id: string) => get<Product>(`/api/products/${id}`),

  /** Tahrirlash formasi uchun: `name_uz`/`name_ru`/`name_en` va ko'p tilli atributlar. */
  byIdRaw: (id: string) => getRaw<ProductRaw>(`/api/products/${id}`),

  /** Filtr paneli uchun fasetlar. Filtrga `key`/`value` ketadi, `label` — faqat ekranga. */
  facets: (filters: ProductFilters = {}) =>
    get<ProductFacets>('/api/products/filters', filters),

  create: (body: ProductInput) => post<Product>('/api/products', body),

  update: (id: string, body: ProductUpdateInput) =>
    patch<Product>(`/api/products/${id}`, body),

  updateFlags: (id: string, flags: ProductFlagsInput) =>
    patch<Product>(`/api/products/${id}/flags`, flags),

  updateStock: (id: string, quantity: number) =>
    patch<Product>(`/api/products/${id}/stock`, { quantity }),

  bulkArchive: (ids: string[], is_archived: boolean) =>
    patch<{ updated: number }>('/api/products/bulk/archive', { ids, is_archived }),

  setArchived: (id: string, is_archived: boolean) =>
    patch<Product>(`/api/products/${id}/flags`, { is_archived }),

  remove: (id: string) => del<Product>(`/api/products/${id}`),

  /*
   * Sharhlar — adminkada faqat MODERATSIYA: o'qish va o'chirish.
   * Sharh yozish (`POST`) mijoz oqimi, tahrirlash endpointi umuman yo'q.
   */
  getReviews: (productId: string, params?: { page?: number; limit?: number; rating?: number; verified_only?: boolean; sort?: string }) =>
    getList<Review>(`/api/products/${productId}/reviews`, params),

  getReviewSummary: (productId: string) =>
    get<ReviewSummary>(`/api/products/${productId}/reviews/summary`),

  deleteReview: (id: string) => del<void>(`/api/reviews/${id}`),
}
