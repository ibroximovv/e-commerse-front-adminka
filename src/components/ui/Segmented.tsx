import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  /** O'ng tomondagi soni ("Faol · 12"). */
  count?: number
  icon?: ReactNode
}

/**
 * Bir qatorli tanlov (ko'rinish rejimi, status filtri, til tabi).
 *
 * Sahifalarda bir xil ko'rinishdagi tugma guruhlari qayta-qayta yozilib,
 * har birida boshqacha radius/rang chiqib ketgan edi — endi shu bitta joyda.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
  ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors',
              size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
              active
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon}
            {option.label}
            {typeof option.count === 'number' ? (
              <span
                className={cn(
                  'tabular-nums',
                  active ? 'text-muted-foreground' : 'text-muted-foreground/70',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
