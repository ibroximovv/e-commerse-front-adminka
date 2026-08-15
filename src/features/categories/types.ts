export interface CategoryInput {
  name: string
  slug?: string
  description?: string
  image?: string
  icon?: string | null
  parent_id?: string | null
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
  parent_id?: string
  root_only?: boolean
  is_featured?: boolean
  with_product_count?: boolean
  include_archived?: boolean
  archivedStatus?: 'all' | 'active' | 'archived'
}
