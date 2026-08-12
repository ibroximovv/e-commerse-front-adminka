import { Card, CardContent } from 'dgz-ui/card'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon: LucideIcon
  tone?: 'neutral' | 'brand' | 'success' | 'warning'
}) {
  const tones = {
    neutral: 'bg-muted text-muted-foreground',
    brand: 'bg-brand-muted text-brand',
    success: 'bg-success-muted text-success',
    warning: 'bg-warning-muted text-warning',
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>

        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            tones[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  )
}
