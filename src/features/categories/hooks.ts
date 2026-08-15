import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from './api'
import type { CategoryFilters, CategoryInput, CategoryUpdateInput } from './types'

export function useCategories(filters: CategoryFilters = { include_archived: true }) {
  return useQuery({
    queryKey: ['categories', filters],
    queryFn: () => categoriesApi.list(filters),
    placeholderData: (prev) => prev,
  })
}

export function useCategoryTree(params?: {
  with_product_count?: boolean
  root_id?: string
  include_archived?: boolean
}) {
  return useQuery({
    queryKey: ['categories', 'tree', params],
    queryFn: () => categoriesApi.tree(params),
    placeholderData: (prev) => prev,
  })
}

export function useCategoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['categories'] })
    void qc.invalidateQueries({ queryKey: ['products'] })
  }

  return {
    create: useMutation({
      mutationFn: (body: CategoryInput) => categoriesApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: CategoryUpdateInput }) =>
        categoriesApi.update(id, body),
      onSuccess: invalidate,
    }),
    setArchived: useMutation({
      mutationFn: ({ id, is_archived }: { id: string; is_archived: boolean }) =>
        categoriesApi.setArchived(id, is_archived),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => categoriesApi.remove(id),
      onSuccess: invalidate,
    }),
  }
}
