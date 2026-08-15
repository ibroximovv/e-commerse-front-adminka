import { del, get, getList, patch, post } from '@/lib/api'
import type { Product, Review, ReviewSummary } from '@/lib/types'
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

  bySlug: (slug: string) => get<Product>(`/api/products/slug/${slug}`),

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

  // Showcase endpoints
  getTop: (params?: { limit?: number; category_id?: string; category_slug?: string; only_manual?: boolean }) =>
    get<Product[]>('/api/products/top', params),

  getBestSellers: (params?: { limit?: number; category_id?: string; category_slug?: string }) =>
    get<Product[]>('/api/products/best-sellers', params),

  getFeatured: (params?: { limit?: number; category_id?: string; category_slug?: string }) =>
    get<Product[]>('/api/products/featured', params),

  getNewArrivals: (params?: { limit?: number; within_days?: number; category_id?: string }) =>
    get<Product[]>('/api/products/new-arrivals', params),

  getDiscounted: (params?: { limit?: number; category_id?: string }) =>
    get<Product[]>('/api/products/discounted', params),

  getTopRated: (params?: { limit?: number; category_id?: string }) =>
    get<Product[]>('/api/products/top-rated', params),

  getRelated: (id: string, params?: { limit?: number }) =>
    get<Product[]>(`/api/products/${id}/related`, params),

  // Reviews & Rating endpoints
  getReviews: (productId: string, params?: { page?: number; limit?: number; rating?: number; verified_only?: boolean; sort?: string }) =>
    getList<Review>(`/api/products/${productId}/reviews`, params),

  getReviewSummary: (productId: string) =>
    get<ReviewSummary>(`/api/products/${productId}/reviews/summary`),

  createReview: (productId: string, body: { rating: number; comment?: string }) =>
    post<Review>(`/api/products/${productId}/reviews`, body),

  deleteReview: (id: string) => del<void>(`/api/reviews/${id}`),
}
