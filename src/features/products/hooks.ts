import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from './api'
import type { ProductFilters, ProductInput, ProductUpdateInput } from './types'

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

export function useProductMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['products'] })
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
