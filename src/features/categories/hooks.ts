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

/** Selectlar uchun to'liq ro'yxat (avvalgi `useCategoryTree` o'rniga). */
export function useAllCategories(params?: {
  with_product_count?: boolean
  include_archived?: boolean
}) {
  return useQuery({
    queryKey: ['categories', 'all', params],
    queryFn: () => categoriesApi.all(params),
    placeholderData: (prev) => prev,
  })
}

/**
 * Tahrirlash formasi uchun uchala tildagi qiymatlar.
 * Ro'yxatdagi `Category` da faqat bitta til bor — u bilan formani to'ldirsak,
 * saqlaganda qolgan ikki til shu tarjima bilan almashib ketardi.
 */
export function useCategoryRaw(id?: string) {
  return useQuery({
    queryKey: ['category', id, 'raw'],
    queryFn: () => (id ? categoriesApi.byIdRaw(id) : null),
    enabled: !!id,
  })
}

export function useCategoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['categories'] })
    void qc.invalidateQueries({ queryKey: ['category'] })
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
