import { getList, patch } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/types'

export const ordersApi = {
  /**
   * Sahifalash YO'Q — hamma buyurtma bitta javobda keladi, ichida `user`,
   * `items.product` va `payment` bilan. Filtrlash va kesish frontendda.
   *
   * Detal sahifasi ham AYNAN shu javobdan o'qiydi: `GET /api/orders/:id` da
   * bog'langan yozuvlar (mahsulot nomi, to'lov) kelishi hujjatlashtirilmagan,
   * bu esa keshni ham bo'lishishga imkon beradi.
   */
  list: () => getList<Order>('/api/orders/admin/all'),

  updateStatus: (id: string, status: OrderStatus) =>
    patch<Order>(`/api/orders/${id}/status`, { status }),
}
