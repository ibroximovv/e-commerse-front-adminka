import { get, getList, patch } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/types'

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  start_date?: string
}

export const ordersApi = {
  list: (params?: OrderQueryParams) =>
    getList<Order>('/api/orders/admin/all', {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.status && params.status !== 'ALL' ? { status: params.status } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.start_date ? { start_date: params.start_date } : {}),
    }),

  getById: (id: string) => get<Order>(`/api/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    patch<Order>(`/api/orders/${id}/status`, { status }),

  cancel: (id: string) => patch<Order>(`/api/orders/${id}/cancel`),

  archive: (id: string) => patch<Order>(`/api/orders/${id}/archive`),
}
