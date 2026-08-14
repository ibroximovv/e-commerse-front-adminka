import { Loader } from 'dgz-ui-shared/components/loader'
import { lazy, Suspense } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { NotFoundPage } from '@/components/ui/ErrorPage'
import { GuestRoute, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { setUnauthorizedHandler } from '@/lib/api'

/*
 * Marshrutlar `lazy()` bilan bo'lingan. Sabab: `dgz-ui-shared/components/form`
 * barreli quill (html-editor) va react-select ni ham tortadi va hammasi bitta
 * entry chunk'ga tushib ketardi (~1.1MB). Bo'linganda formalar faqat tegishli
 * sahifa ochilganda yuklanadi.
 */
const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage')
const DashboardPage = lazyPage(
  () => import('@/features/dashboard/DashboardPage'),
  'DashboardPage',
)
const ProductsPage = lazyPage(
  () => import('@/features/products/pages/ProductsPage'),
  'ProductsPage',
)
const CategoriesPage = lazyPage(
  () => import('@/features/categories/pages/CategoriesPage'),
  'CategoriesPage',
)
const OrdersPage = lazyPage(
  () => import('@/features/orders/pages/OrdersPage'),
  'OrdersPage',
)
const OrderDetailPage = lazyPage(
  () => import('@/features/orders/pages/OrderDetailPage'),
  'OrderDetailPage',
)
const UsersPage = lazyPage(() => import('@/features/users/pages/UsersPage'), 'UsersPage')
const ProfilePage = lazyPage(() => import('@/features/profile/ProfilePage'), 'ProfilePage')

/** `lazy()` default eksport kutadi, bizda esa hamma sahifa nomli eksport. */
function lazyPage<K extends string>(
  loader: () => Promise<Record<K, React.ComponentType>>,
  name: K,
) {
  return lazy(() => loader().then((module) => ({ default: module[name] })))
}

function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader />
    </div>
  )
}

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
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
