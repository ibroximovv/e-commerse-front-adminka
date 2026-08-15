import { AlertTriangle, CheckCircle, PackageX, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { StockHealth } from './hooks'

export function StockHealthCard({ stockHealth }: { stockHealth: StockHealth }) {
  const { t } = useTranslation()
  const total = stockHealth.inStock + stockHealth.lowStock + stockHealth.outOfStock

  const inStockPercent = total > 0 ? Math.round((stockHealth.inStock / total) * 100) : 0
  const lowStockPercent = total > 0 ? Math.round((stockHealth.lowStock / total) * 100) : 0
  const outOfStockPercent = total > 0 ? Math.round((stockHealth.outOfStock / total) * 100) : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/70 p-5 shadow-xs backdrop-blur-md">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="size-4 text-brand" />
          {t('dashboard.stockHealth')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('dashboard.stockHealthHint')}
        </p>
      </div>

      {/* Visual Stock Distribution Bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40 p-0.5">
        {inStockPercent > 0 && (
          <div
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            style={{ width: `${inStockPercent}%` }}
            title={`${t('dashboard.inStockProducts')}: ${stockHealth.inStock}`}
          />
        )}
        {lowStockPercent > 0 && (
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${lowStockPercent}%` }}
            title={`${t('dashboard.lowStockProducts')}: ${stockHealth.lowStock}`}
          />
        )}
        {outOfStockPercent > 0 && (
          <div
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
            style={{ width: `${outOfStockPercent}%` }}
            title={`${t('dashboard.outOfStockProducts')}: ${stockHealth.outOfStock}`}
          />
        )}
      </div>

      {/* Stock Legend Capsules */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs">
          <CheckCircle className="size-4 text-emerald-500 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {stockHealth.inStock}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('dashboard.inStockProducts')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">
          <AlertTriangle className="size-4 text-amber-500 shrink-0" />
          <div>
            <div className="font-semibold text-amber-600 dark:text-amber-400">
              {stockHealth.lowStock}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('dashboard.lowStockProducts')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs">
          <PackageX className="size-4 text-rose-500 shrink-0" />
          <div>
            <div className="font-semibold text-rose-600 dark:text-rose-400">
              {stockHealth.outOfStock}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {t('dashboard.outOfStockProducts')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
