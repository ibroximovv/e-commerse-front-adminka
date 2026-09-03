import { cn } from '@/lib/utils'
import { LOCALE_ORDER } from '@/lib/localized'
import type { Language } from '@/lib/types'

/**
 * Ko'p tilli maydonlar uchun til tanlagich.
 *
 * `filled` — qaysi tillar to'ldirilgani; to'ldirilmagani xira nuqta bilan
 * belgilanadi, shunda admin qaysi tarjima yetishmayotganini formani
 * aylanmasdan ko'radi.
 */
export function LanguageTabs({
  value,
  onChange,
  filled,
  className,
}: {
  value: Language
  onChange: (language: Language) => void
  filled?: Partial<Record<Language, boolean>>
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-md bg-muted/50 p-0.5', className)}>
      {LOCALE_ORDER.map((language) => {
        const active = language === value
        const isFilled = filled?.[language]

        return (
          <button
            key={language}
            type="button"
            onClick={() => onChange(language)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
              active
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {language}
            {filled ? (
              <span
                aria-hidden
                className={cn(
                  'size-1 rounded-full',
                  isFilled ? 'bg-success' : 'bg-muted-foreground/35',
                )}
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
