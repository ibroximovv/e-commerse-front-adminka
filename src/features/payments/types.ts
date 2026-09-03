import type { PaymentStatus } from '@/lib/types'

export interface PaymentQueryParams {
  page?: number
  limit?: number
  status?: string
  provider?: string
  /** Payme tranzaksiya ID, buyurtma ID yoki provayder bo'yicha — serverda. */
  search?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaymentFilters {
  search: string
  status: PaymentStatus | 'ALL'
  provider: string
}

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  search: '',
  status: 'ALL',
  provider: 'ALL',
}

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'SUCCESSFUL',
  'FAILED',
  'REFUNDED',
]

/**
 * Adminkada faqat Payme bor — eski soxta provayderlar (`POST /api/payments`
 * bilan "darhol to'landi" qilib belgilanadiganlar) backenddan olib tashlandi.
 */
export const PAYMENT_PROVIDERS = ['payme'] as const
