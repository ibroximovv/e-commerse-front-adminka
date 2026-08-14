import { del, getList, patch } from '@/lib/api'
import type { User } from '@/lib/types'
import type { UserUpdateInput } from './types'

export const usersApi = {
  /** Sahifalash YO'Q — hammasi bitta massivda. Kesish frontendda. */
  list: () => getList<User>('/api/users'),

  update: (id: string, body: UserUpdateInput) =>
    patch<User>(`/api/users/${id}`, body),

  /** Butunlay o'chiradi — arxivlash varianti backendda yo'q. */
  remove: (id: string) => del<User>(`/api/users/${id}`),
}
