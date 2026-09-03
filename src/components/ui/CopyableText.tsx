import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * Bosilganda matnni buferga nusxalaydigan yacheyka — ID, tranzaksiya kodi kabi
 * qo'lda ko'chirib bo'lmaydigan uzun qiymatlar uchun.
 */
export function CopyableText({
  text,
  label,
  className,
}: {
  text: string
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={label ?? t('common.copy')}
      className={cn(
        'group flex items-center gap-1.5 font-mono text-xs text-foreground transition-colors hover:text-brand',
        className,
      )}
    >
      <span className="max-w-[140px] truncate">{text}</span>
      {copied ? (
        <Check className="size-3 shrink-0 text-success" aria-label={t('common.copied')} />
      ) : (
        <Copy
          className="size-3 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100"
          aria-hidden
        />
      )}
    </button>
  )
}
