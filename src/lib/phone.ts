/*
 * Phone is the login key now. The backend accepts any shape (`901112233`,
 * `+998 (90) 111-22-33`, `998901112233`) and normalizes to E.164, but we
 * validate the same rules client-side so the user doesn't wait for a 400.
 */

const UZ_PREFIX = '998'

/** Any input → `+998XXXXXXXXX`, or `null` if it isn't a valid UZ number. */
export function normalizePhone(input?: string | null): string | null {
  const digits = (input ?? '').replace(/\D/g, '')
  if (digits.length === 9) return `+${UZ_PREFIX}${digits}`
  if (digits.length === 12 && digits.startsWith(UZ_PREFIX)) return `+${digits}`
  return null
}

export const isValidPhone = (input?: string | null) => normalizePhone(input) !== null

/** `+998901234567` → `+998 90 123 45 67`. Unknown shapes are returned as-is. */
export function formatPhone(phone?: string | null): string {
  if (!phone) return ''
  const normalized = normalizePhone(phone)
  if (!normalized) return phone

  const d = normalized.slice(4)
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`
}

/** Search helper: compare digits only, so "90 123" matches "+998901234567". */
export function phoneMatches(phone: string | null | undefined, query: string): boolean {
  const q = query.replace(/\D/g, '')
  return !!phone && q.length > 0 && phone.replace(/\D/g, '').includes(q)
}
