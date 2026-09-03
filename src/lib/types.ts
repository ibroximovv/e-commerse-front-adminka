/**
 * Backend domen tiplari.
 * Manba: ../e-commerse/docs/admin-frontend.md §6 va prisma/schema.prisma.
 *
 * Maydon nomlari backenddagidek snake_case qoladi — konvertatsiya qilinmaydi.
 */

export type Role = 'ADMIN' | 'USER'

export type Language = 'uz' | 'ru' | 'en'

/**
 * Ko'p tilli maydon (`name`, `description`, atribut `key`/`value`/`unit`).
 *
 * O'qishda backend bitta satr qaytaradi (`?ln` bo'yicha), tahrirlash formasi
 * esa `?raw=true` bilan uchala tilni `name_uz`/`name_ru`/`name_en` ko'rinishida
 * oladi. Yozishda aynan shu obyekt yuboriladi.
 *
 * `PATCH` da yuborilmagan til tegilmaydi — bo'sh tilni obyektga QO'SHMANG,
 * aks holda "o'zgartirmaslik" niyati bilan "tozalash" farqlanmay qoladi.
 */
export type Localized = Partial<Record<Language, string>>

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

/**
 * Katalog TEKIS — ichki kategoriya yo'q. `parent_id`, `children`, `/tree` va
 * `breadcrumbs` backenddan olib tashlangan, ularni qaytarib qo'shmang.
 */
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string | null
  is_featured?: boolean
  sort_order?: number
  product_count?: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

/** `GET /api/categories/:id?raw=true` — tahrirlash formasi uchun uchala til. */
export interface CategoryRaw extends Omit<Category, 'name' | 'description'> {
  name_uz?: string
  name_ru?: string
  name_en?: string
  description_uz?: string
  description_ru?: string
  description_en?: string
}

export interface ProductAttribute {
  key: string
  value: string
  /** O'lchov birligi ("Vt", "mm"). Kalitga QO'SHMANG — fasetni bo'lib yuboradi. */
  unit?: string | null
}

/** `?raw=true` dagi atribut — har bir maydon uchala tilda. */
export interface ProductAttributeRaw {
  key_uz?: string
  key_ru?: string
  key_en?: string
  value_uz?: string
  value_ru?: string
  value_en?: string
  unit_uz?: string | null
  unit_ru?: string | null
  unit_en?: string | null
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
  /** Narx kelishilgan holda — savatga/buyurtmaga tushmaydi, `price` doim 0. */
  price_on_request?: boolean
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
  created_at: string
  updated_at: string
  /* Fiskalizatsiya — Payme chekini soliq organiga uzatish uchun. */
  ikpu_code?: string | null
  package_code?: string | null
  vat_percent?: number | null
  units?: number | null
}

/** `GET /api/products/:id?raw=true` — tahrirlash formasi uchun uchala til. */
export interface ProductRaw
  extends Omit<Product, 'name' | 'description' | 'attributes'> {
  name_uz?: string
  name_ru?: string
  name_en?: string
  description_uz?: string
  description_ru?: string
  description_en?: string
  attributes: ProductAttributeRaw[]
}

export interface ProductFacets {
  price: { min: number; max: number }
  categories: { id: string; name: string; slug: string; count: number }[]
  brands: { value: string; count: number }[]
  /*
   * `key`/`value` — tilga bog'lanmagan identifikator, FILTRGA shular ketadi.
   * `label` — joriy tildagi ko'rinish, faqat ekranga. Ikkalasini almashtirsangiz
   * til o'zgarganda tanlangan filtrlar tushib qoladi.
   */
  attributes: {
    key: string
    label: string
    unit?: string | null
    values: { value: string; label: string; count: number }[]
  }[]
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

/**
 * Payme tranzaksiyasining holati. `status` bilan birga o'qiladi:
 * `FAILED` + `CANCELLED` = bekor qilindi, `FAILED` + `CANCELLED_AFTER_PERFORM`
 * = pul qaytarildi. Ikkalasi ham `FAILED`, farqi faqat shu maydonda.
 */
export type PaymeState =
  | 'CREATED'
  | 'PERFORMED'
  | 'CANCELLED'
  | 'CANCELLED_AFTER_PERFORM'

export interface Payment {
  id: string
  order_id?: string
  amount: number
  provider: string
  status: PaymentStatus
  payme_transaction_id?: string | null
  payme_state?: PaymeState | null
  /** Payme vaqtlari — millisekundlik UNIX timestamp, ISO satr emas. */
  payme_create_time?: number | null
  payme_perform_time?: number | null
  payme_cancel_time?: number | null
  payme_reason?: number | string | null
  created_at?: string
  updated_at?: string
}

/** `POST /api/payments/checkout` javobi (adminka ishlatmaydi, mijoz oqimi). */
export interface PaymentCheckout {
  order_id: string
  provider: string
  amount: number
  checkout_url: string
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
  shipping_address?: string
  customer_phone?: string
  customer_name?: string
  notes?: string
  payment_method?: string
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

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export interface UserStats {
  total_users: number
  verified_users: number
  admin_count?: number
  user_count?: number
}

export interface DashboardMonthlySales {
  month: string
  revenue: number
  orders: number
}

export interface DashboardStats {
  revenue: {
    total_revenue: number
    paid_revenue: number
  }
  orders: {
    total: number
    pending: number
    confirmed: number
    shipped: number
    delivered: number
    cancelled: number
  }
  products: {
    total_active: number
    archived: number
    out_of_stock: number
    low_stock: number
  }
  users: {
    total_users: number
    verified_users: number
  }
  monthly_sales: DashboardMonthlySales[]
  recent_orders: Order[]
  top_products: Product[]
}

export interface SystemHealth {
  status: string
  uptime?: number
  timestamp?: string
  database?: {
    status: string
    latency?: number
  }
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

/**
 * Barcha muvaffaqiyatli javoblar shu konvertda keladi (ResponseInterceptor).
 *
 * `message` va `meta` qiymati bo'lmasa javobda KALITNING O'ZI yo'q (`null` emas)
 * — ixtiyoriy kirish ishlating. `language` javob qaysi tilda qaytganini
 * bildiradi va kesh kalitiga qo'shiladi.
 */
export interface Envelope<T> {
  success: boolean
  data: T
  message?: string | null
  meta?: Meta | null
  language?: Language
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
