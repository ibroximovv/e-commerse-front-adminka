import { getList } from '@/lib/api'
import type { Order, Product, User } from '@/lib/types'

/**
 * Backend'da tayyor statistika endpointi YO'Q — sanoqlar shu yerdagi
 * ro'yxatlardan frontendda hisoblanadi.
 */
export const dashboardApi = {
  /** Sahifalash yo'q — hamma buyurtma bir javobda keladi. */
  orders: () => getList<Order>('/api/orders/admin/all'),

  /**
   * Faqat jami sonni olish uchun: `limit=1` bilan bitta yozuv so'raymiz va
   * `meta.total` ni o'qiymiz. `all=true` — arxivlanganlar ham hisobga olinadi.
   */
  productsCount: async () => {
    const { meta } = await getList<Product>('/api/products', { all: true, limit: 1 })
    return meta?.total ?? 0
  },

  /** Sahifalash yo'q — uzunlikning o'zi jami son. */
  usersCount: async () => {
    const { items } = await getList<User>('/api/users')
    return items.length
  },
}
