import { Tags } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CategoryStat } from './hooks'

export function CategoryDistribution({
  categoryStats,
}: {
  categoryStats: CategoryStat[]
}) {
  const { t } = useTranslation()

  if (categoryStats.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/70 p-5 shadow-xs backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Tags className="size-4 text-brand" />
            {t('dashboard.categoryDistribution')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('dashboard.categoryDistributionHint')}
          </p>
        </div>
      </div>

      <div className="space-y-3.5 pt-1">
        {categoryStats.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.name}</span>
              <span className="font-mono text-muted-foreground">
                {item.count} {t('search.products')} ({item.percent}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500 ease-out"
                style={{ width: `${Math.max(item.percent, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
