import { useTranslation } from 'react-i18next'
import type { DashboardStats } from '@/lib/types'

export function StockHealthCard({
  products,
}: {
  products?: DashboardStats['products']
}) {
  const { t } = useTranslation()

  const lowStock = products?.low_stock ?? 0
  const outOfStock = products?.out_of_stock ?? 0
  /*
   * Narxi kelishiladigan tovarlar ataylab `stock: 0` bilan turadi va backend
   * ularni `out_of_stock` ga QO'SHMAYDI. Bu yerda ham alohida ajratamiz —
   * aks holda ular "zaxirada bor" bo'lib sanalib, ko'rsatkich yolg'on chiqadi.
   */
  const onRequest = products?.price_on_request ?? 0
  const totalActive = products?.total_active ?? 0
  const inStock = Math.max(0, totalActive - lowStock - outOfStock - onRequest)

  const total = inStock + lowStock + outOfStock + onRequest

  const percent = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)
  const inStockPercent = percent(inStock)
  const lowStockPercent = percent(lowStock)
  const outOfStockPercent = percent(outOfStock)
  const onRequestPercent = percent(onRequest)

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {t('dashboard.stockHealth')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('dashboard.stockHealthHint')}
        </p>
      </div>

      {/* Visual Stock Distribution Bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {inStockPercent > 0 && (
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
            style={{ width: `${inStockPercent}%` }}
          />
        )}
        {lowStockPercent > 0 && (
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${lowStockPercent}%` }}
          />
        )}
        {outOfStockPercent > 0 && (
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${outOfStockPercent}%` }}
          />
        )}
        {onRequestPercent > 0 && (
          <div
            className="h-full bg-muted-foreground/40 transition-all duration-300"
            style={{ width: `${onRequestPercent}%` }}
          />
        )}
      </div>

      {/* Stock Legend Capsules */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <div className="font-semibold text-foreground">{inStock}</div>
          <div className="text-[11px] text-muted-foreground truncate">{t('dashboard.inStockProducts')}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <div className="font-semibold text-foreground">{lowStock}</div>
          <div className="text-[11px] text-muted-foreground truncate">{t('dashboard.lowStockProducts')}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <div className="font-semibold text-foreground">{outOfStock}</div>
          <div className="text-[11px] text-muted-foreground truncate">{t('dashboard.outOfStockProducts')}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <div className="font-semibold text-foreground">{onRequest}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {t('dashboard.priceOnRequestProducts')}
          </div>
        </div>
      </div>
    </div>
  )
}
