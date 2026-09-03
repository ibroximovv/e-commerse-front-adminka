import { Button } from 'dgz-ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useController, useFieldArray } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { controlClass } from '@/components/ui/Field'
import { LanguageTabs } from '@/components/ui/LanguageTabs'
import type { Language } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Xarakteristikalar redaktori.
 *
 * Har bir maydon (`key`, `value`, `unit`) uchala tilda saqlanadi, lekin
 * ekranda bir vaqtda faqat bitta til ko'rsatiladi — 3 ta ustun × 3 til = 9 ta
 * input bo'lib ketmasligi uchun. Til yuqoridagi tab orqali almashadi.
 *
 * Ikki qoida faset (filtr paneli) buzilmasligi uchun muhim:
 *  1. Birlikni kalitga qo'shmang — `key: "Мощность"` + `unit: "Вт"`, aks holda
 *     bitta xarakteristika bir nechta faset guruhiga bo'linib ketadi.
 *  2. Sonli qiymat uchala tilda bir xil yozilsin (`"250"`); faqat matnli
 *     qiymatlar tarjima qilinadi (`Медный` / `Mis` / `Copper`).
 */
export function AttributesEditor<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>
  name: Path<T>
}) {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<Language>('uz')

  const { fields, append, remove } = useFieldArray({
    control,
    // useFieldArray massiv yo'lini talab qiladi; `name` chaqiruvchida tekshiriladi
    name: name as never,
  })

  const inputClass = cn(controlClass, 'h-8 px-2.5 text-xs')

  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-medium text-foreground">{t('product.attributes')}</h3>
          <p className="text-[11px] text-muted-foreground">{t('product.attributesHint')}</p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageTabs value={language} onChange={setLanguage} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ key: {}, value: {}, unit: {} } as never)}
          >
            <Plus className="size-3.5" aria-hidden />
            {t('product.addAttribute')}
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          {t('product.noAttributes')}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_7rem_2rem] gap-2 px-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>{t('product.attrKey')}</span>
            <span>{t('product.attrValue')}</span>
            <span>{t('product.attrUnit')}</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_7rem_2rem] sm:items-center"
            >
              <AttributeInput
                control={control}
                name={`${name}.${index}.key.${language}` as Path<T>}
                placeholder={t('product.attrKeyPlaceholder')}
                className={inputClass}
              />
              <AttributeInput
                control={control}
                name={`${name}.${index}.value.${language}` as Path<T>}
                placeholder={t('product.attrValuePlaceholder')}
                className={inputClass}
              />
              <AttributeInput
                control={control}
                name={`${name}.${index}.unit.${language}` as Path<T>}
                placeholder={t('product.attrUnitPlaceholder')}
                className={inputClass}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                title={t('common.delete')}
                className="size-8 justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Til almashganda `name` o'zgaradi, shuning uchun `register` o'rniga
 * controller ishlatiladi — aks holda RHF eski yo'ldagi qiymatni ushlab qolib,
 * inputga boshqa tilning matnini chizib qo'yadi.
 */
function AttributeInput<T extends FieldValues>({
  control,
  name,
  placeholder,
  className,
}: {
  control: Control<T>
  name: Path<T>
  placeholder: string
  className: string
}) {
  const { field } = useController({ control, name })

  return (
    <input
      type="text"
      value={(field.value as string | undefined) ?? ''}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
      placeholder={placeholder}
      className={className}
    />
  )
}
