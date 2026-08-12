import { dayjs } from 'dgz-ui/utils'

export { cn } from 'dgz-ui/utils'
export { dayjs }

/** Narx — backend'da Float. Ko'rsatishda ming ajratgich bilan. */
export function formatPrice(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatDate(value?: string | null): string {
  return value ? dayjs(value).format('DD.MM.YYYY') : '—'
}

export function formatDateTime(value?: string | null): string {
  return value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—'
}

/** "Omadbek Ibrohimov" → "OI"; email bo'lsa birinchi harf. */
export function initials(name?: string | null, fallback?: string | null): string {
  const source = name?.trim() || fallback?.trim() || ''
  if (!source) return '?'

  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/**
 * Xato obyektidan foydalanuvchiga ko'rsatiladigan matn.
 * `lib/api.ts` interceptori xatolarni allaqachon `Error` ga aylantiradi, lekin
 * 500 javoblarida `message` ichida Prisma'ning xom xatosi (server fayl yo'llari
 * bilan) kelishi mumkin — uni ko'rsatmaymiz.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const raw = error.message
  if (!raw) return fallback

  const looksInternal =
    raw.length > 200 ||
    raw.includes('\n') ||
    /prisma|invocation:|at .*\.(ts|js):\d+|node_modules/i.test(raw)

  return looksInternal ? fallback : raw
}
