/**
 * Backend domen tiplari.
 * Manba: ../e-commerse/docs/admin-frontend.md §6 va prisma/schema.prisma.
 *
 * Maydon nomlari backenddagidek snake_case qoladi — konvertatsiya qilinmaydi.
 */

export type Role = 'ADMIN' | 'USER'

export type Language = 'uz' | 'ru' | 'en'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED'

export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  photo?: string
  role: Role
  is_verified: boolean
  language: Language
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ProductAttribute {
  key: string
  value: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  images: string[]
  attributes: ProductAttribute[]
  is_archived: boolean
  category_id: string
  category?: Category
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  amount: number
  provider: string
  status: PaymentStatus
  transaction_id?: string
}

export interface OrderItem {
  id: string
  product_id: string
  product: Product
  quantity: number
  price_at_purchase: number
}

export interface Order {
  id: string
  user_id: string
  user?: User
  total_amount: number
  status: OrderStatus
  is_archived: boolean
  created_at: string
  updated_at: string
  items: OrderItem[]
  payment?: Payment
}

export interface Tokens {
  access_token: string
  refresh_token: string
}

/** Sahifalash ma'lumoti. Hozircha faqat GET /api/products qaytaradi. */
export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Barcha muvaffaqiyatli javoblar shu konvertda keladi (ResponseInterceptor). */
export interface Envelope<T> {
  success: boolean
  data: T
  message?: string | null
  meta?: Meta | null
}

/** Buyurtma statusining ruxsat etilgan ketma-ketligi.
 *
 * Backend statuslar ketma-ketligini TEKSHIRMAYDI (DELIVERED dan PENDING ga ham
 * qaytaradi) — cheklov faqat shu yerda. */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]
