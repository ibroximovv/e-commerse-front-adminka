import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { NotFoundPage } from '@/components/ui/ErrorPage'
import { GuestRoute, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { setUnauthorizedHandler } from '@/lib/api'

export function AppRoutes() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  /*
   * Refresh ham yiqilganda `lib/api.ts` shu callback'ni chaqiradi.
   * `window.location.href` o'rniga router navigatsiyasi — sahifa qayta
   * yuklanmaydi va holat saqlanadi.
   */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      toast.info(t('auth.sessionExpired'))
      navigate('/login', { replace: true })
    })
  }, [navigate, t])

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
