import { del, get, getList, patch, post } from '@/lib/api'
import type { Product } from '@/lib/types'
import type { ProductFilters, ProductInput, ProductUpdateInput } from './types'

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const { includeArchived, ...rest } = filters
    /*
     * Backend BUG: `all=false` yuborilsa u `all=true` kabi ishlaydi.
     * Shu sababli faqat `includeArchived` rost bo'lganda `all: true` yuboriladi,
     * aks holda `all` parametri umuman qo'shilmaydi.
     */
    const queryParams: Record<string, unknown> = { ...rest }
    if (includeArchived) {
      queryParams.all = true
    }

    return getList<Product>('/api/products', queryParams)
  },

  byId: (id: string) => get<Product>(`/api/products/${id}`),

  create: (body: ProductInput) => post<Product>('/api/products', body),

  update: (id: string, body: ProductUpdateInput) =>
    patch<Product>(`/api/products/${id}`, body),

  setArchived: (id: string, is_archived: boolean) =>
    patch<Product>(`/api/products/${id}`, { is_archived }),

  remove: (id: string) => del<Product>(`/api/products/${id}`),
}
