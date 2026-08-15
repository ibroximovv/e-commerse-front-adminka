import { Clock, DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from './hooks'
import { CategoryDistribution } from './CategoryDistribution'
import { RecentOrders } from './RecentOrders'
import { StatCard } from './StatCard'
import { StatusDistribution } from './StatusDistribution'
import { StockHealthCard } from './StockHealthCard'
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
            <Skeleton key={index} className="h-[104px]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (isError) {
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

  const pending = stats.byStatus.PENDING ?? 0

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />

      {/* Primary Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.totalOrders')}
          value={formatNumber(stats.totalOrders)}
          icon={ShoppingCart}
          tone="brand"
        />
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={formatPrice(stats.revenue)}
          hint={t('dashboard.revenueHint')}
          icon={DollarSign}
          tone="success"
        />
        <StatCard
          label={t('dashboard.totalProducts')}
          value={formatNumber(stats.productsCount)}
          hint={t('dashboard.productsHint')}
          icon={Package}
        />
        <StatCard
          label={t('dashboard.totalUsers')}
          value={formatNumber(stats.usersCount)}
          hint={t('dashboard.usersHint')}
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

      {/* Stock Health & Category Distribution Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StockHealthCard stockHealth={stats.stockHealth} />
        <CategoryDistribution categoryStats={stats.categoryStats} />
      </div>

      {/* Orders Status Breakdown & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusDistribution byStatus={stats.byStatus} total={stats.totalOrders} />
        <RecentOrders orders={stats.recentOrders} />
      </div>
    </div>
  )
}
