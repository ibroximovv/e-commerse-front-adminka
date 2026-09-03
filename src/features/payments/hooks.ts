import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from './api'
import type { PaymentQueryParams } from './types'

export function usePayments(params?: PaymentQueryParams) {
  return useQuery({
    queryKey: ['payments', 'admin', params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function usePaymentStatus(order_id?: string) {
  return useQuery({
    queryKey: ['payment', 'status', order_id],
    queryFn: () => paymentsApi.status(order_id!),
    enabled: !!order_id,
  })
}
