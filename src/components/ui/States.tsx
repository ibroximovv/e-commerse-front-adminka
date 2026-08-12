import { Button } from 'dgz-ui/button'
import { Empty } from 'dgz-ui-shared/components/empty'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn, errorMessage } from '@/lib/utils'

/**
 * Har bir ma'lumot ko'rsatadigan ekran uchala holatni qamrashi kerak:
 * yuklanmoqda (Skeleton), bo'sh (EmptyState), xato (ErrorState).
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} />
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <Empty icon={icon} className={cn('py-12', className)}>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-foreground">
          {title ?? t('empty.title')}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {description ?? t('empty.description')}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </Empty>
  )
}

export function ErrorState({
  error,
  onRetry,
  title,
  className,
}: {
  error?: unknown
  onRetry?: () => void
  title?: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {title ?? t('error.title')}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {errorMessage(error, t('error.generic'))}
        </p>
      </div>

      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="size-4" aria-hidden />
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  )
}
