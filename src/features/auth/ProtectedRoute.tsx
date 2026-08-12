import { Loader } from 'dgz-ui-shared/components/loader'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProfile } from './hooks'
import { tokens } from '@/lib/tokens'

/**
 * Rolni token ichidan emas, `GET /api/users/profile` orqali tekshiramiz —
 * bazadagi haqiqiy holatni beradi.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const hasToken = tokens.exists()
  const { data, isLoading, isError } = useProfile()

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader />
      </div>
    )
  }

  if (isError || data?.role !== 'ADMIN') {
    tokens.clear()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Login sahifasi: allaqachon kirgan bo'lsa dashboard'ga yuboradi. */
export function GuestRoute() {
  if (tokens.exists()) return <Navigate to="/" replace />
  return <Outlet />
}
