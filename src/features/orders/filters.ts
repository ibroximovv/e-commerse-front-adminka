import type { OrderFilters } from './types'
import type { Order } from '@/lib/types'
import { dayjs } from '@/lib/utils'

/**
 * Endpoint query parametr qabul qilmaydi — qidiruv, status va sana filtri
 * to'liq shu yerda, mijoz tomonda ishlaydi.
 */
export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  const query = filters.search.trim().toLowerCase()
  /* Kun oxirigacha kirsin — `to` ni sanani o'zi deb olsak, o'sha kun tushib qoladi. */
  const from = filters.from ? dayjs(filters.from).startOf('day') : null
  const to = filters.to ? dayjs(filters.to).endOf('day') : null

  return orders.filter((order) => {
    if (filters.status !== 'ALL' && order.status !== filters.status) return false

    if (from || to) {
      const created = dayjs(order.created_at)
      if (from && created.isBefore(from)) return false
      if (to && created.isAfter(to)) return false
    }

    if (query) {
      const haystack = [
        order.id,
        order.user?.full_name,
        order.user?.email,
        order.user?.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(query)) return false
    }

    return true
  })
}

/** Yangi buyurtma tepada. Backend tartibiga tayanmaymiz. */
export function sortByNewest(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  )
}
