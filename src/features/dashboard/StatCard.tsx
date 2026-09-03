import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon: LucideIcon
  tone?: 'neutral' | 'brand' | 'success' | 'warning'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground truncate">{hint}</p>
          ) : null}
        </div>

        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
    </div>
  )
}
