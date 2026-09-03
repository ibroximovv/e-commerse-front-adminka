import { useTranslation } from 'react-i18next'

export function StockHealthCard({
  products,
  stockHealth,
}: {
  products?: {
    total_active: number
    archived: number
    out_of_stock: number
    low_stock: number
  }
  stockHealth?: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
}) {
  const { t } = useTranslation()

  const lowStock = products?.low_stock ?? stockHealth?.lowStock ?? 0
  const outOfStock = products?.out_of_stock ?? stockHealth?.outOfStock ?? 0
  const totalActive = products?.total_active ?? ((stockHealth?.inStock ?? 0) + lowStock + outOfStock)
  const inStock = Math.max(0, totalActive - lowStock - outOfStock)

  const total = inStock + lowStock + outOfStock

  const inStockPercent = total > 0 ? Math.round((inStock / total) * 100) : 0
  const lowStockPercent = total > 0 ? Math.round((lowStock / total) * 100) : 0
  const outOfStockPercent = total > 0 ? Math.round((outOfStock / total) * 100) : 0

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
      </div>

      {/* Stock Legend Capsules */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
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
      </div>
    </div>
  )
}
