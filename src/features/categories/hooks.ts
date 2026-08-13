import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from './api'
import type { CategoryInput, CategoryUpdateInput } from './types'

export function useCategories(all = true) {
  return useQuery({
    queryKey: ['categories', { all }],
    queryFn: () => categoriesApi.list(all),
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
