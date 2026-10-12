import { dayjs } from 'dgz-ui/utils'
import i18n from 'i18next'

export { cn } from 'dgz-ui/utils'
export { dayjs }

/**
 * Backend returns every amount as a whole UZS integer (no tiyin), so no
 * fraction digits. Grouping follows the UI language: "1 250 000 so'm".
 */
export function formatPrice(value: number): string {
  return `${formatNumber(Math.round(value ?? 0))} ${currencyLabel()}`
}

function currencyLabel(): string {
  const language = i18n.language
  if (language === 'ru') return 'сум'
  if (language === 'en') return 'UZS'
  return "so'm"
}

export function formatNumber(value: number): string {
  // Space grouping for every language — 'en-US' commas look odd next to "so'm"
  return new Intl.NumberFormat('ru-RU').format(value).replace(/\u00a0|\u202f/g, ' ')
}

export function formatDate(value?: string | null): string {
  return value ? dayjs(value).format('DD.MM.YYYY') : '—'
}

export function formatDateTime(value?: string | null): string {
  return value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—'
}

/**
 * MongoDB ObjectId 24 belgidan iborat va jadvalda o'qib bo'lmaydi —
 * oxirgi 6 tasi yetadi ("#a1b2c3").
 */
export function shortId(id?: string | null): string {
  return id ? `#${id.slice(-6).toUpperCase()}` : '—'
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
