import { useState } from 'react'
import { useController } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Field, controlClass } from './Field'
import { LanguageTabs } from './LanguageTabs'
import { LOCALE_ORDER } from '@/lib/localized'
import type { Language, Localized } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * `name` / `description` kabi ko'p tilli maydon: bitta input, ustida uz/ru/en
 * tabi. Qiymat `Localized` obyekt sifatida formada saqlanadi va shu ko'rinishda
 * backendga ketadi.
 *
 * Bo'sh qolgan tilni tozalash uchun ishlatib bo'lmaydi — bo'sh satr backend
 * uchun "to'ldirilmagan" degani. Yuborishdan oldin `cleanLocalized()` ni
 * o'tkazing.
 */
export function LocalizedField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  multiline,
  rows = 3,
  hint,
}: {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  rows?: number
  hint?: string
}) {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<Language>('uz')
  const { field, fieldState } = useController({ control, name })

  const value = (field.value ?? {}) as Localized
  const filled = Object.fromEntries(
    LOCALE_ORDER.map((lang) => [lang, !!value[lang]?.trim()]),
  ) as Partial<Record<Language, boolean>>

  const handleChange = (text: string) => {
    field.onChange({ ...value, [language]: text })
  }

  const shared = {
    value: value[language] ?? '',
    onChange: (e: { target: { value: string } }) => handleChange(e.target.value),
    onBlur: field.onBlur,
    placeholder: placeholder ? `${placeholder} (${language.toUpperCase()})` : undefined,
    className: cn(controlClass, multiline && 'h-auto py-2'),
  }

  return (
    <Field
      label={label}
      required={required}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
      hint={hint}
      action={
        <LanguageTabs value={language} onChange={setLanguage} filled={filled} />
      }
    >
      {multiline ? <textarea rows={rows} {...shared} /> : <input type="text" {...shared} />}
    </Field>
  )
}
