import { getList } from '@/lib/api'
import type { Category, Order, Product, User } from '@/lib/types'

/**
 * Backend'da tayyor statistika endpointi YO'Q — sanoqlar shu yerdagi
 * ro'yxatlardan frontendda hisoblanadi.
 */
export const dashboardApi = {
  /** Sahifalash yo'q — hamma buyurtma bir javobda keladi. */
  orders: () => getList<Order>('/api/orders/admin/all'),

  /** Categories list with product count */
  categories: () =>
    getList<Category>('/api/categories', {
      include_archived: true,
      with_product_count: true,
    }),

  /** Products list for stock health analysis */
  products: () =>
    getList<Product>('/api/products', {
      include_archived: true,
      limit: 100,
    }),

  /**
   * Faqat jami sonni olish uchun: `limit=1` bilan bitta yozuv so'raymiz va
   * `meta.total` ni o'qiymiz. `include_archived=true` — arxivlanganlar ham hisobga olinadi.
   */
  productsCount: async () => {
    const { meta } = await getList<Product>('/api/products', {
      include_archived: true,
      limit: 1,
    })
    return meta?.total ?? 0
  },

  /** Sahifalash yo'q — uzunlikning o'zi jami son. */
  usersCount: async () => {
    const { items } = await getList<User>('/api/users')
    return items.length
  },
}
