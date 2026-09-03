import { del, get, getList, patch } from '@/lib/api'
import type { Role, User, UserStats } from '@/lib/types'
import type { UserUpdateInput } from './types'

export interface UserQueryParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

export const usersApi = {
  list: (params?: UserQueryParams) =>
    getList<User>('/api/users', {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.role && params.role !== 'ALL' ? { role: params.role } : {}),
      ...(params?.search ? { search: params.search } : {}),
    }),

  stats: () => get<UserStats>('/api/users/stats'),

  updateRole: (id: string, role: Role) =>
    patch<User>(`/api/users/${id}/role`, { role }),

  update: (id: string, body: UserUpdateInput) =>
    patch<User>(`/api/users/${id}`, body),

  remove: (id: string) => del<User>(`/api/users/${id}`),
}
