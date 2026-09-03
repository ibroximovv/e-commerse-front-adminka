/**
 * Ko'p tilli maydonlar bilan ishlash. Backend ikki xil shakl beradi:
 *
 *   oddiy so'rov   → `name: "Avtomatik nasos"`        (bitta til, `?ln` bo'yicha)
 *   `?raw=true`    → `name_uz`, `name_ru`, `name_en`   (uchala til, tahrirlash uchun)
 *
 * Yozishda esa doim obyekt ketadi: `{ name: { uz, ru, en } }`.
 */

import type { Language, Localized } from './types'

export const LOCALE_ORDER: Language[] = ['uz', 'ru', 'en']

/**
 * `?raw=true` javobidagi `<field>_uz|_ru|_en` uchligini bitta obyektga yig'adi.
 *
 * ```ts
 * fromRaw(product, 'name') // → { uz: '…', ru: '…', en: '…' }
 * ```
 */
export function fromRaw(source: object | null | undefined, field: string): Localized {
  const result: Localized = {}
  if (!source) return result

  const record = source as Record<string, unknown>

  for (const lang of LOCALE_ORDER) {
    const value = record[`${field}_${lang}`]
    if (typeof value === 'string' && value.trim()) result[lang] = value
  }

  return result
}

/**
 * Formadan kelgan qiymatni yuborishga tayyorlaydi: bo'sh tillarni tashlaydi.
 *
 * Bo'sh satr yuborish tilni TOZALAMAYDI — backend uni "to'ldirilmagan" deb
 * hisoblaydi. Shuning uchun ularni umuman qo'shmaymiz: `PATCH` da yuborilmagan
 * til o'zgarishsiz qoladi.
 *
 * Hech qaysi til to'ldirilmagan bo'lsa `undefined` qaytadi, ya'ni maydon
 * so'rovga umuman kirmaydi.
 */
export function cleanLocalized(value: Localized | undefined): Localized | undefined {
  if (!value) return undefined

  const result: Localized = {}
  for (const lang of LOCALE_ORDER) {
    const text = value[lang]?.trim()
    if (text) result[lang] = text
  }

  return Object.keys(result).length > 0 ? result : undefined
}

/** Kamida bitta til to'ldirilganmi (`name` uchun majburiy shart). */
export function hasAnyLocale(value: Localized | undefined): boolean {
  return !!cleanLocalized(value)
}

/**
 * To'ldirilmagan tillar ro'yxati — formada "tarjima qilinmagan" belgisi uchun.
 * Umuman bo'sh maydon uchun bo'sh massiv qaytadi (u "tarjimasiz" emas,
 * "kiritilmagan" — belgilash chalg'itadi).
 */
export function missingLocales(value: Localized | undefined): Language[] {
  const filled = cleanLocalized(value)
  if (!filled) return []
  return LOCALE_ORDER.filter((lang) => !filled[lang])
}

/**
 * Ko'rsatish uchun bitta satr. Fallback backenddagidek:
 * so'ralgan til → uz → ru → en.
 */
export function pickLocale(value: Localized | undefined, lang: Language): string {
  if (!value) return ''
  return value[lang] ?? value.uz ?? value.ru ?? value.en ?? ''
}
