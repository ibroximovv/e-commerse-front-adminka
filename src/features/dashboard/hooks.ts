import { useQueries } from '@tanstack/react-query'
import { dashboardApi } from './api'
import { ORDER_STATUSES } from '@/lib/types'
import type { Category, Order, OrderStatus, Product } from '@/lib/types'

export interface CategoryStat {
  id: string
  name: string
  slug: string
  count: number
  percent: number
}

export interface StockHealth {
  inStock: number
  lowStock: number
  outOfStock: number
}

export interface DashboardStats {
  orders: Order[]
  totalOrders: number
  revenue: number
  byStatus: Record<OrderStatus, number>
  recentOrders: Order[]
  productsCount: number
  usersCount: number
  categoryStats: CategoryStat[]
  stockHealth: StockHealth
}

function buildStats(
  orders: Order[],
  productsCount: number,
  usersCount: number,
  categories: Category[],
  products: Product[],
) {
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

  // Stock health computation
  let inStock = 0
  let lowStock = 0
  let outOfStock = 0

  for (const p of products) {
    if (p.stock <= 0) {
      outOfStock += 1
    } else if (p.stock <= 5) {
      lowStock += 1
    } else {
      inStock += 1
    }
  }

  // Category product distribution computation
  const totalCategoryProducts = categories.reduce(
    (acc, c) => acc + (c.product_count ?? 0),
    0,
  )

  const categoryStats: CategoryStat[] = categories
    .map((c) => {
      const count = c.product_count ?? 0
      const percent =
        totalCategoryProducts > 0
          ? Math.round((count / totalCategoryProducts) * 100)
          : 0
      return {
        id: c.id,
        name: c.name,
        slug: c.slug ?? '',
        count,
        percent,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return {
    orders,
    totalOrders: orders.length,
    revenue,
    byStatus,
    recentOrders,
    productsCount,
    usersCount,
    categoryStats,
    stockHealth: { inStock, lowStock, outOfStock },
  } satisfies DashboardStats
}

export function useDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['orders', 'admin'], queryFn: dashboardApi.orders },
      { queryKey: ['products', 'count'], queryFn: dashboardApi.productsCount },
      { queryKey: ['users', 'count'], queryFn: dashboardApi.usersCount },
      { queryKey: ['categories', 'all'], queryFn: dashboardApi.categories },
      { queryKey: ['products', 'all'], queryFn: dashboardApi.products },
    ],
  })

  const [ordersQuery, productsCountQuery, usersQuery, categoriesQuery, productsQuery] =
    results

  return {
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    error: results.find((result) => result.error)?.error,
    refetch: () => results.forEach((result) => void result.refetch()),
    stats: buildStats(
      ordersQuery.data?.items ?? [],
      productsCountQuery.data ?? 0,
      usersQuery.data ?? 0,
      categoriesQuery.data?.items ?? [],
      productsQuery.data?.items ?? [],
    ),
  }
}
