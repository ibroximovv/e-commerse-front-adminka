import type { ProductAttribute } from '@/lib/types'

export interface ProductInput {
  name: string
  description?: string
  price: number
  stock: number
  category_id: string
  images?: string[]
  attributes?: ProductAttribute[]
}

export interface ProductUpdateInput extends Partial<ProductInput> {
  is_archived?: boolean
}

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  category_id?: string
  min_price?: number
  max_price?: number
  sortBy?: 'name' | 'price' | 'stock' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  includeArchived?: boolean
}
