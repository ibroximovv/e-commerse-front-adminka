import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from './api'

export const DASHBOARD_STATS_KEY = ['dashboard', 'stats'] as const

export function useDashboard() {
  const query = useQuery({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: dashboardApi.getStats,
    staleTime: 60 * 1000,
  })

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
