import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from './api'
import type { OrderStatus } from '@/lib/types'

/**
 * Kalit dashboard bilan bir xil (`['orders', 'admin']`) — ikkalasi ham aynan
 * shu endpointni oladi, shuning uchun bitta keshni bo'lishadi.
 */
export function useOrders() {
  return useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: ordersApi.list,
    placeholderData: (prev) => prev,
  })
}

/** Detal sahifasi uchun — alohida so'rov yo'q, ro'yxatdan topiladi. */
export function useOrder(id?: string) {
  const query = useOrders()

  return {
    ...query,
    order: id ? query.data?.items.find((item) => item.id === id) : undefined,
  }
}

export function useOrderMutations() {
  const qc = useQueryClient()

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
        ordersApi.updateStatus(id, status),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    }),
  }
}
