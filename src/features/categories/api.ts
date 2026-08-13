import { del, get, getList, patch, post } from '@/lib/api'
import type { Category } from '@/lib/types'
import type { CategoryInput, CategoryUpdateInput } from './types'

export const categoriesApi = {
  list: (all = true) => getList<Category>('/api/categories', { all }),
  byId: (id: string) => get<Category>(`/api/categories/${id}`),
  create: (body: CategoryInput) => post<Category>('/api/categories', body),
  update: (id: string, body: CategoryUpdateInput) =>
    patch<Category>(`/api/categories/${id}`, body),
  setArchived: (id: string, is_archived: boolean) =>
    patch<Category>(`/api/categories/${id}`, { is_archived }),
  remove: (id: string) => del<Category>(`/api/categories/${id}`),
}
