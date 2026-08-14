import type { Language, Role } from '@/lib/types'

/**
 * `PATCH /api/users/:id` FAQAT shu to'rt maydonni qabul qiladi.
 * `role` DTO'da umuman yo'q — admin API orqali yaratilmaydi (seed/baza orqali).
 */
export interface UserUpdateInput {
  full_name?: string
  phone?: string
  photo?: string
  language?: Language
}

export interface UserFilters {
  search: string
  role: Role | 'ALL'
  verified: 'ALL' | 'VERIFIED' | 'UNVERIFIED'
}

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: '',
  role: 'ALL',
  verified: 'ALL',
}
