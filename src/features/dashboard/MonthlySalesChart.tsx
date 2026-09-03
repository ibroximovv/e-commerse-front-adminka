import { useTranslation } from 'react-i18next'
import type { DashboardMonthlySales } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export function MonthlySalesChart({
  monthlySales = [],
}: {
  monthlySales?: DashboardMonthlySales[]
}) {
  const { t } = useTranslation()

  if (!monthlySales || monthlySales.length === 0) {
    return null
  }

  const maxRevenue = Math.max(...monthlySales.map((s) => s.revenue), 1)

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {t('dashboard.monthlySalesTitle')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.monthlySalesSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span>{t('dashboard.revenue')}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6 pt-2">
        {monthlySales.map((item) => {
          const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8)

          return (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 text-center"
            >
              <span className="text-[10px] font-mono text-muted-foreground">
                {item.orders} ta
              </span>

              {/* Bar column */}
              <div className="relative flex h-24 w-full items-end justify-center rounded bg-muted/30 p-1">
                <div
                  className="w-full max-w-[20px] rounded-xs bg-primary transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              <div className="w-full space-y-0.5">
                <p className="font-mono text-[11px] font-semibold text-foreground truncate">
                  {formatPrice(item.revenue)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.month}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
