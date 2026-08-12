import { useQueries } from '@tanstack/react-query'
import { dashboardApi } from './api'
import { ORDER_STATUSES } from '@/lib/types'
import type { Order, OrderStatus } from '@/lib/types'

export interface DashboardStats {
  orders: Order[]
  totalOrders: number
  /** Bekor qilinganlar hisobga olinmaydi — ular tushum emas. */
  revenue: number
  byStatus: Record<OrderStatus, number>
  recentOrders: Order[]
  productsCount: number
  usersCount: number
}

function buildStats(orders: Order[], productsCount: number, usersCount: number) {
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>

  let revenue = 0

  for (const order of orders) {
    byStatus[order.status] = (byStatus[order.status] ?? 0) + 1
    if (order.status !== 'CANCELLED') revenue += order.total_amount
  }

  const recentOrders = [...orders]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 5)

  return {
    orders,
    totalOrders: orders.length,
    revenue,
    byStatus,
    recentOrders,
    productsCount,
    usersCount,
  } satisfies DashboardStats
}

export function useDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['orders', 'admin'], queryFn: dashboardApi.orders },
      { queryKey: ['products', 'count'], queryFn: dashboardApi.productsCount },
      { queryKey: ['users', 'count'], queryFn: dashboardApi.usersCount },
    ],
  })

  const [ordersQuery, productsQuery, usersQuery] = results

  return {
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    error: results.find((result) => result.error)?.error,
    refetch: () => results.forEach((result) => void result.refetch()),
    stats: buildStats(
      ordersQuery.data?.items ?? [],
      productsQuery.data ?? 0,
      usersQuery.data ?? 0,
    ),
  }
}
