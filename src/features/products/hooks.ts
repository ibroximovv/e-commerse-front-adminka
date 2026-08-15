import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from './api'
import type {
  ProductFilters,
  ProductFlagsInput,
  ProductInput,
  ProductUpdateInput,
} from './types'

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? productsApi.byId(id) : null),
    enabled: !!id,
  })
}

export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => (slug ? productsApi.bySlug(slug) : null),
    enabled: !!slug,
  })
}

export function useProductReviews(
  productId?: string,
  params?: { page?: number; limit?: number; rating?: number; verified_only?: boolean; sort?: string },
) {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: () => (productId ? productsApi.getReviews(productId, params) : null),
    enabled: !!productId,
  })
}

export function useReviewSummary(productId?: string) {
  return useQuery({
    queryKey: ['review-summary', productId],
    queryFn: () => (productId ? productsApi.getReviewSummary(productId) : null),
    enabled: !!productId,
  })
}

export function useProductMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['products'] })
    void qc.invalidateQueries({ queryKey: ['product'] })
  }

  return {
    create: useMutation({
      mutationFn: (body: ProductInput) => productsApi.create(body),
      onSuccess: invalidate,
    }),

    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: ProductUpdateInput }) =>
        productsApi.update(id, body),
      onSuccess: invalidate,
    }),

    updateFlags: useMutation({
      mutationFn: ({ id, flags }: { id: string; flags: ProductFlagsInput }) =>
        productsApi.updateFlags(id, flags),
      onSuccess: invalidate,
    }),

    updateStock: useMutation({
      mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
        productsApi.updateStock(id, quantity),
      onSuccess: invalidate,
    }),

    bulkArchive: useMutation({
      mutationFn: ({ ids, is_archived }: { ids: string[]; is_archived: boolean }) =>
        productsApi.bulkArchive(ids, is_archived),
      onSuccess: invalidate,
    }),

    setArchived: useMutation({
      mutationFn: ({ id, is_archived }: { id: string; is_archived: boolean }) =>
        productsApi.setArchived(id, is_archived),
      onSuccess: invalidate,
    }),

    remove: useMutation({
      mutationFn: (id: string) => productsApi.remove(id),
      onSuccess: invalidate,
    }),
  }
}
