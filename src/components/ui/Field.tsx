import { Search } from 'lucide-react'
import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Kutubxonaning `My*` komponentlari qamramaydigan joylar uchun (native
 * `select`, atribut redaktoridagi inputlar) yagona ko'rinish. Ilgari har bir
 * modal o'z klasslar zanjirini yozar edi va balandlik/radius sahifadan
 * sahifaga farq qilardi.
 */
export const controlClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground ' +
  'transition-colors placeholder:text-muted-foreground ' +
  'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30 ' +
  'disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground'

export function Field({
  label,
  required,
  hint,
  error,
  action,
  htmlFor,
  children,
  className,
}: {
  label?: ReactNode
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  /** Yorliq qatorining o'ng tomoni (masalan til tabi). */
  action?: ReactNode
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label || action ? (
        <div className="flex min-h-5 items-center justify-between gap-2">
          {label ? (
            <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
              {label}
              {required ? <span className="ml-0.5 text-destructive">*</span> : null}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}

      {children}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export const NativeSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function NativeSelect({ className, ...props }, ref) {
  return <select ref={ref} className={cn(controlClass, 'pr-8', className)} {...props} />
})

/**
 * Ikonasi bilan birga qidiruv maydoni. Har bir ro'yxat sahifasi buni o'zicha
 * yig'ar edi — ikonaning joyi va input balandligi sahifadan sahifaga farq
 * qilardi.
 */
export const SearchInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { wrapperClassName?: string }
>(function SearchInput({ className, wrapperClassName, ...props }, ref) {
  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={ref}
        type="search"
        className={cn(controlClass, 'pl-9', className)}
        {...props}
      />
    </div>
  )
})
