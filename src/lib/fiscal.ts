/**
 * Fiskalizatsiya (IKPU) maydonlari bilan ishlash.
 *
 * Payme chekni soliq organiga uzatadi va buning uchun `ikpu_code`,
 * `package_code`, `vat_percent` MAJBURIY. Kod topilmasa to'lov `-31008` bilan
 * to'xtaydi — `.env` dagi eski `PAYME_DEFAULT_*` zaxirasi olib tashlangan.
 *
 * Kodlar KATEGORIYADA saqlanadi (8 ta kategoriya butun katalogni qamraydi),
 * mahsulotdagisi esa faqat istisno uchun — u kategoriyanikini qoplaydi.
 */

import type { FiscalFields } from './types'

/** Formada hamma maydon SATR: `<select>`/`<input>` bo'sh qiymatni "" deb beradi. */
export interface FiscalFormValues {
  ikpu_code: string
  package_code: string
  vat_percent: string
  units: string
}

export const EMPTY_FISCAL_FORM: FiscalFormValues = {
  ikpu_code: '',
  package_code: '',
  vat_percent: '',
  units: '',
}

/** QQS faqat shu ikki qiymat bo'lishi mumkin. */
export const VAT_OPTIONS = [0, 12] as const

/**
 * Fiskal ma'lumot to'liqmi. `units` sanalmaydi — u ixtiyoriy, yo'qligi
 * to'lovni to'xtatmaydi (chekka qator qo'shilmaydi, xolos).
 */
export function hasFiscalData(source: FiscalFields | null | undefined): boolean {
  if (!source) return false
  // `vat_percent: 0` — haqiqiy qiymat ("QQS to'lovchisi emasman"), bo'sh emas
  return !!source.ikpu_code && !!source.package_code && source.vat_percent != null
}

/** Backend javobini forma qiymatlariga aylantiradi. */
export function fiscalToForm(source: FiscalFields | null | undefined): FiscalFormValues {
  if (!source) return EMPTY_FISCAL_FORM

  return {
    ikpu_code: source.ikpu_code ?? '',
    package_code: source.package_code ?? '',
    vat_percent: source.vat_percent == null ? '' : String(source.vat_percent),
    units: source.units == null ? '' : String(source.units),
  }
}

/**
 * Forma qiymatlarini so'rov tanasiga aylantiradi.
 *
 * Bo'sh maydon `null` bo'lib ketadi — ya'ni "kategoriyanikini ishlat"
 * (mahsulotda) yoki "to'ldirilmagan" (kategoriyada). `units: 0` mavjud
 * bo'lmagan kod, shuning uchun nol ham `null` ga aylanadi.
 */
export function fiscalFromForm(values: Partial<FiscalFormValues>): FiscalFields {
  const vat = values.vat_percent?.trim()
  const units = Number(values.units?.trim())

  return {
    ikpu_code: values.ikpu_code?.trim() || null,
    package_code: values.package_code?.trim() || null,
    vat_percent: vat ? Number(vat) : null,
    units: units > 0 ? units : null,
  }
}
