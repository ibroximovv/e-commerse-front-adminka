import { get } from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/api/dashboard/stats'),
}

