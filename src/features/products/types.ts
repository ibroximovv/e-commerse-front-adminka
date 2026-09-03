import type { Localized, ProductSortPreset, StockStatus } from '@/lib/types'

/** Yozishda atributning har bir maydoni ko'p tilli. */
export interface ProductAttributeInput {
  key: Localized
  value: Localized
  unit?: Localized
}

export interface ProductInput {
  /** Kamida bitta til majburiy; bo'shlari to'ldirilganidan nusxalanadi. */
  name: Localized
  slug?: string
  sku?: string | null
  description?: Localized
  brand?: string | null
  tags?: string[]
  price: number
  discount_price?: number | null
  /** Yoqilsa `price` 0 bo'lib saqlanadi va mahsulot savatga tushmaydi. */
  price_on_request?: boolean
  stock: number
  category_id: string
  images?: string[]
  /** PATCH da TO'LIQ massiv yuboriladi — backend eskisini butunlay almashtiradi. */
  attributes?: ProductAttributeInput[]
  is_top?: boolean
  is_featured?: boolean
  /* Fiskalizatsiya — bo'sh qolsa backend `.env` dagi zaxira qiymatni oladi. */
  ikpu_code?: string | null
  package_code?: string | null
  vat_percent?: number | null
  units?: number | null
}

export interface ProductUpdateInput extends Partial<ProductInput> {
  is_archived?: boolean
}

export interface ProductFlagsInput {
  is_top?: boolean
  is_featured?: boolean
  is_archived?: boolean
}

export interface ProductStockInput {
  quantity: number
}

export interface BulkArchiveInput {
  ids: string[]
  is_archived: boolean
}

export interface ProductFilters {
  page?: number
  limit?: number
  /** Qidiruv uchala tilda ishlaydi — ruscha so'rov o'zbekcha interfeysda ham topadi. */
  search?: string
  category_id?: string
  category_ids?: string | string[]
  category_slug?: string
  min_price?: number
  max_price?: number
  price_on_request?: boolean
  has_discount?: boolean
  min_discount_percent?: number
  brands?: string
  tags?: string
  /** `Key:Value` juftliklari, vergul bilan: `Power:250,Material:Copper`. */
  attributes?: string
  stock_status?: StockStatus
  in_stock?: boolean
  min_rating?: number
  is_top?: boolean
  is_featured?: boolean
  new_within_days?: number
  sort?: ProductSortPreset
  sortBy?: 'name' | 'price' | 'stock' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  with_facets?: boolean
  includeArchived?: boolean
}
