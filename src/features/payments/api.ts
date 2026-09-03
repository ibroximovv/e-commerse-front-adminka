import { get, getList } from '@/lib/api'
import type { Payment } from '@/lib/types'
import type { PaymentQueryParams } from './types'

/**
 * Adminka to'lovni FAQAT kuzatadi.
 *
 * `POST /api/payments` (to'lovni "muvaffaqiyatli" deb belgilaydigan eski
 * endpoint) backenddan olib tashlandi, o'rniga haqiqiy Payme kassasi:
 * `POST /api/payments/checkout` → `checkout_url`. U faqat mijozning o'z
 * buyurtmasi uchun ishlaydi, shuning uchun bu yerda yo'q — adminkaga to'lov
 * tugmasi qo'ymang.
 */
export const paymentsApi = {
  list: (params?: PaymentQueryParams) =>
    getList<Payment>('/api/payments/admin/all', {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.status && params.status !== 'ALL' ? { status: params.status } : {}),
      ...(params?.provider && params.provider !== 'ALL' ? { provider: params.provider } : {}),
      ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
    }),

  status: (order_id: string) => get<Payment>(`/api/payments/status/${order_id}`),
}
