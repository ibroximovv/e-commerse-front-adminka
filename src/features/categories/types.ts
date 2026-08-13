export interface CategoryInput {
  name: string
  description?: string
  image?: string
}

export interface CategoryUpdateInput extends Partial<CategoryInput> {
  is_archived?: boolean
}

export interface CategoryFilters {
  all?: boolean
  search?: string
  archivedStatus?: 'all' | 'active' | 'archived'
}
