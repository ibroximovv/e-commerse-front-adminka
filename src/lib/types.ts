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

export interface CategoryBreadcrumb {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string | null
  parent_id?: string | null
  children?: Category[]
  is_featured?: boolean
  sort_order?: number
  product_count?: number
  breadcrumbs?: CategoryBreadcrumb[]
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ProductAttribute {
  key: string
  value: string
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export type ProductSortPreset =
  | 'relevance'
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'popular'
  | 'top_rated'
  | 'most_viewed'
  | 'discount'
  | 'name_asc'
  | 'name_desc'

export interface Product {
  id: string
  name: string
  slug: string
  sku?: string | null
  description?: string
  brand?: string | null
  tags?: string[]
  price: number
  discount_price?: number | null
  final_price: number
  discount_percent: number
  stock: number
  stock_status?: StockStatus
  is_new?: boolean
  images: string[]
  attributes: ProductAttribute[]
  is_top: boolean
  is_featured: boolean
  sales_count: number
  view_count: number
  rating: number
  rating_count: number
  popularity_score: number
  is_archived: boolean
  category_id: string
  category?: Category
  breadcrumbs?: CategoryBreadcrumb[]
  created_at: string
  updated_at: string
}

export interface ProductFacets {
  price: { min: number; max: number }
  categories: { id: string; name: string; slug: string; count: number }[]
  brands: { value: string; count: number }[]
  attributes: { key: string; values: { value: string; count: number }[] }[]
  counts: { in_stock: number; discounted: number; rating_4_plus: number }
  attributes_sampled?: boolean
}

export interface Review {
  id: string
  user_id: string
  user?: User
  product_id: string
  rating: number
  comment?: string
  is_verified_purchase: boolean
  created_at: string
  updated_at: string
}

export interface ReviewSummary {
  average: number
  count: number
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>
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

/** Sahifalash ma'lumoti va fasetlar. */
export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  sort?: string
  facets?: ProductFacets
}

/** Barcha muvaffaqiyatli javoblar shu konvertda keladi (ResponseInterceptor). */
export interface Envelope<T> {
  success: boolean
  data: T
  message?: string | null
  meta?: Meta | null
}

/** Buyurtma statusining ruxsat etilgan ketma-ketligi. */
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
