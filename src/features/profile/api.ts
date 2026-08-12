import { get, patch } from '@/lib/api'
import type { Language, User } from '@/lib/types'

/** Backend faqat shu 4 ta maydonni qabul qiladi — `role` DTO'da umuman yo'q. */
export interface ProfileInput {
  full_name?: string
  phone?: string
  photo?: string
  language?: Language
}

export const profileApi = {
  me: () => get<User>('/api/users/profile'),
  update: (body: ProfileInput) => patch<User>('/api/users/profile', body),
}
