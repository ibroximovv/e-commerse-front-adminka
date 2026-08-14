import type { OrderStatus } from '@/lib/types'

/**
 * Filtrlar faqat FRONTENDDA qo'llanadi — `GET /api/orders/admin/all` hech qanday
 * query parametr qabul qilmaydi va hamma buyurtmani bir javobda qaytaradi.
 */
export interface OrderFilters {
  search: string
  status: OrderStatus | 'ALL'
  /** `YYYY-MM-DD` yoki bo'sh satr. */
  from: string
  to: string
}

export const DEFAULT_ORDER_FILTERS: OrderFilters = {
  search: '',
  status: 'ALL',
  from: '',
  to: '',
}
