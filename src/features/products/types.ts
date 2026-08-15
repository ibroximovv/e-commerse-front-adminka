import type { ProductAttribute, ProductSortPreset, StockStatus } from '@/lib/types'

export interface ProductInput {
  name: string
  slug?: string
  sku?: string | null
  description?: string
  brand?: string | null
  tags?: string[]
  price: number
  discount_price?: number | null
  stock: number
  category_id: string
  images?: string[]
  attributes?: ProductAttribute[]
  is_top?: boolean
  is_featured?: boolean
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
  search?: string
  category_id?: string
  category_ids?: string | string[]
  category_slug?: string
  include_descendants?: boolean
  min_price?: number
  max_price?: number
  has_discount?: boolean
  min_discount_percent?: number
  brands?: string
  tags?: string
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
