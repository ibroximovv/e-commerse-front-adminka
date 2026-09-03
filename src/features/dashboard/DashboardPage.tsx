import { Clock, DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from './hooks'
import { MonthlySalesChart } from './MonthlySalesChart'
import { RecentOrders } from './RecentOrders'
import { StatCard } from './StatCard'
import { StatusDistribution } from './StatusDistribution'
import { StockHealthCard } from './StockHealthCard'
import { TopProducts } from './TopProducts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { formatNumber, formatPrice } from '@/lib/utils'

export function DashboardPage() {
  const { t } = useTranslation()
  const { stats, isLoading, isError, error, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />
        <ErrorState
          error={error}
          title={t('dashboard.loadFailed')}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const pending = stats.orders?.pending ?? 0

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />

      {/* Primary Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={formatPrice(stats.revenue?.total_revenue ?? 0)}
          hint={
            stats.revenue?.paid_revenue !== undefined
              ? `${t('dashboard.paidRevenue')}: ${formatPrice(stats.revenue.paid_revenue)}`
              : t('dashboard.revenueHint')
          }
          icon={DollarSign}
          tone="success"
        />
        <StatCard
          label={t('dashboard.totalOrders')}
          value={formatNumber(stats.orders?.total ?? 0)}
          hint={`${t('dashboard.deliveredCount')}: ${stats.orders?.delivered ?? 0}`}
          icon={ShoppingCart}
          tone="brand"
        />
        <StatCard
          label={t('dashboard.totalProducts')}
          value={formatNumber(stats.products?.total_active ?? 0)}
          hint={`${t('dashboard.lowStock')}: ${stats.products?.low_stock ?? 0}`}
          icon={Package}
        />
        <StatCard
          label={t('dashboard.totalUsers')}
          value={formatNumber(stats.users?.total_users ?? 0)}
          hint={`${t('dashboard.verifiedUsers')}: ${stats.users?.verified_users ?? 0}`}
          icon={Users}
        />
      </div>

      {pending > 0 ? (
        <StatCard
          label={t('dashboard.pendingAttention')}
          value={formatNumber(pending)}
          hint={t('dashboard.pendingAttentionHint')}
          icon={Clock}
          tone="warning"
        />
      ) : null}

      {/* Monthly Sales Dynamics Chart */}
      {stats.monthly_sales && stats.monthly_sales.length > 0 && (
        <MonthlySalesChart monthlySales={stats.monthly_sales} />
      )}

      {/* Stock Health & Orders Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StockHealthCard products={stats.products} />
        <StatusDistribution orders={stats.orders} />
      </div>

      {/* Top Products & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProducts products={stats.top_products} />
        <RecentOrders orders={stats.recent_orders ?? []} />
      </div>
    </div>
  )
}
