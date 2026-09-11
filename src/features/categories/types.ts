import type { FiscalFields, Localized } from '@/lib/types'

/**
 * Fiskal maydonlar (`ikpu_code`, `package_code`, `vat_percent`, `units`)
 * ASOSAN shu yerda to'ldiriladi — mahsulotdagisi faqat istisno uchun.
 * Bo'sh qolsa bu kategoriyadagi mahsulotlarni to'lab bo'lmaydi (`-31008`).
 */
export interface CategoryInput extends FiscalFields {
  /** Kamida bitta til majburiy; bo'shlari to'ldirilganidan nusxalanadi. */
  name: Localized
  slug?: string
  description?: Localized
  image?: string
  icon?: string | null
  is_featured?: boolean
  sort_order?: number
}

export interface CategoryUpdateInput extends Partial<CategoryInput> {
  is_archived?: boolean
}

export interface CategoryFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'sort_order' | 'name' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
  is_featured?: boolean
  with_product_count?: boolean
  include_archived?: boolean
  archivedStatus?: 'all' | 'active' | 'archived'
}
