import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'dgz-ui/card'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Karta sarlavhasi uchun yagona wrapper.
 *
 * Nega kerak — `dgz-ui` Card'ining ikkita xususiyati bor:
 * 1. `CardTitle` da `justify-between` qattiq yozilgan (o'ng tomonga amal
 *    tugmasi qo'yish uchun). Ikona + matn joylashtirsak, matn o'ng chekkaga
 *    uchib ketadi — shuning uchun `justify-start` bilan bekor qilamiz.
 * 2. `CardDescription` ichida `cn("text-body-sm-regular text-secondary")`
 *    chaqiriladi va tailwind-merge bu ikkalasini `text-*` sifatida
 *    to'qnashuvchi deb hisoblab, o'lchamni tashlab yuboradi. Natijada izoh
 *    sarlavha bilan bir xil kattalikda chiqadi. O'lchamni o'zimiz beramiz.
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  /** Sarlavha qatorining o'ng tomoni. */
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="gap-1 p-5 pb-4">
        <CardTitle className="justify-start gap-2 text-base font-semibold">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : null}
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {action ? <span className="shrink-0">{action}</span> : null}
        </CardTitle>

        {description ? (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className={cn('p-5 pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
