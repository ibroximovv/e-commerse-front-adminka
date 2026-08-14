import { Ban, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Bekor qilingan buyurtma bu bosqichlardan chiqib ketadi — alohida ko'rsatiladi. */
const STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
        <Ban className="size-4 shrink-0" aria-hidden />
        {t('order.cancelledNote')}
      </div>
    )
  }

  const current = STEPS.indexOf(status)

  return (
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const done = index <= current
        const isLast = index === STEPS.length - 1

        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {/* Chap ulagich — birinchi qadamda ko'rinmaydi */}
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === 0
                    ? 'bg-transparent'
                    : index <= current
                      ? 'bg-brand'
                      : 'bg-border',
                )}
              />

              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  done
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-border bg-background text-muted-foreground',
                )}
                aria-current={index === current ? 'step' : undefined}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>

              <span
                className={cn(
                  'h-0.5 flex-1',
                  isLast
                    ? 'bg-transparent'
                    : index < current
                      ? 'bg-brand'
                      : 'bg-border',
                )}
              />
            </div>

            <span
              className={cn(
                'text-center text-[11px] leading-tight',
                done ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {t(`order.status.${step}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
