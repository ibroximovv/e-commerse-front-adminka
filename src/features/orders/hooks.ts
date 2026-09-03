import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi, type OrderQueryParams } from './api'
import type { OrderStatus } from '@/lib/types'

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ['orders', 'admin', params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: !!id,
  })
}

export function useOrderMutations() {
  const qc = useQueryClient()

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
        ordersApi.updateStatus(id, status),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['order'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      },
    }),
    cancel: useMutation({
      mutationFn: (id: string) => ordersApi.cancel(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['order'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      },
    }),
    archive: useMutation({
      mutationFn: (id: string) => ordersApi.archive(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['orders'] })
        qc.invalidateQueries({ queryKey: ['order'] })
        qc.invalidateQueries({ queryKey: ['dashboard'] })
      },
    }),
  }
}
