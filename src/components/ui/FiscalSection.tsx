import { AlertTriangle, ChevronDown, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Field, NativeSelect, controlClass } from './Field'
import { VAT_OPTIONS, hasFiscalData, type FiscalFormValues } from '@/lib/fiscal'
import type { FiscalFields } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FiscalSectionProps {
  /**
   * Kategoriyaning qiymatlari — mahsulot formasida placeholder sifatida
   * ko'rsatiladi: maydon bo'sh qolsa aynan shu kod ishlatiladi.
   */
  fallback?: FiscalFields | null
  /** Mahsulot formasida bo'lim yig'ilgan holda ochiladi — u yer istisno uchun. */
  collapsible?: boolean
  title: string
  description: string
}

/**
 * Fiskalizatsiya bo'limi — kategoriya va mahsulot formalarida bir xil 4 maydon.
 *
 * `useFormContext()` dan o'qiydi, ya'ni forma `<Form {...form}>`
 * (FormProvider) bilan o'ralgan bo'lishi SHART — kutubxonaning `My*`
 * komponentlari ham shuni talab qiladi.
 */
export function FiscalSection({
  fallback,
  collapsible = false,
  title,
  description,
}: FiscalSectionProps) {
  const { t } = useTranslation()
  const { register, control } = useFormContext<FiscalFormValues>()
  const [isOpen, setIsOpen] = useState(!collapsible)

  const values = useWatch({ control })

  /*
   * Ogohlantirish faqat asosiy joyda (kategoriya) — mahsulotda bo'sh maydon
   * "xato" emas, "kategoriyanikini ishlat" degani.
   */
  const isIncomplete =
    !collapsible &&
    !hasFiscalData({
      ikpu_code: values.ikpu_code || null,
      package_code: values.package_code || null,
      vat_percent: values.vat_percent ? Number(values.vat_percent) : null,
    })

  const header = (
    <div className="flex items-start gap-2 text-left">
      <Receipt className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-medium text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {collapsible ? (
        <ChevronDown
          className={cn(
            'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      ) : null}
    </div>
  )

  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full"
        >
          {header}
        </button>
      ) : (
        header
      )}

      {isOpen ? (
        <>
          {isIncomplete ? (
            <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
              <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
              {t('fiscal.incompleteWarning')}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t('fiscal.ikpuCode')} required={!collapsible}>
              <input
                type="text"
                inputMode="numeric"
                className={controlClass}
                placeholder={fallback?.ikpu_code ?? '08413001001003001'}
                {...register('ikpu_code')}
              />
            </Field>

            <Field label={t('fiscal.packageCode')} required={!collapsible}>
              <input
                type="text"
                inputMode="numeric"
                className={controlClass}
                placeholder={fallback?.package_code ?? '1485163'}
                {...register('package_code')}
              />
            </Field>

            {/*
              `0%` va "belgilanmagan" ALOHIDA variant: `vat_percent: 0` —
              "QQS to'lovchisi emasman" degan haqiqiy qiymat, backend uni `??`
              bilan yechadi va kategoriyanikiga tushib ketmaydi.
            */}
            <Field label={t('fiscal.vatPercent')} required={!collapsible}>
              <NativeSelect {...register('vat_percent')}>
                <option value="">
                  {collapsible && fallback?.vat_percent != null
                    ? t('fiscal.fromCategoryValue', { value: fallback.vat_percent })
                    : t('fiscal.notSet')}
                </option>
                {VAT_OPTIONS.map((vat) => (
                  <option key={vat} value={vat}>
                    {vat}%
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field label={t('fiscal.units')} hint={t('fiscal.unitsHint')}>
              <input
                type="text"
                inputMode="numeric"
                className={controlClass}
                placeholder={fallback?.units ? String(fallback.units) : '241092'}
                {...register('units')}
              />
            </Field>
          </div>
        </>
      ) : null}
    </section>
  )
}
