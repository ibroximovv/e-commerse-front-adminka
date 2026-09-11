import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useCategoryMutations, useCategoryRaw } from '../hooks'
import type { CategoryInput } from '../types'
import { Field } from '@/components/ui/Field'
import { FiscalSection } from '@/components/ui/FiscalSection'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LocalizedField } from '@/components/ui/LocalizedField'
import { EMPTY_FISCAL_FORM, fiscalFromForm, fiscalToForm } from '@/lib/fiscal'
import { cleanLocalized, fromRaw, hasAnyLocale } from '@/lib/localized'
import type { Category, Localized } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const localized = z.object({
  uz: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
})

const schema = z.object({
  name: localized.refine(hasAnyLocale, 'category.validation.nameRequired'),
  slug: z.string().optional(),
  icon: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
  is_featured: z.boolean().optional(),
  description: localized,
  image: z.string().optional(),
  /* Fiskalizatsiya — formada satr, yuborishdan oldin songa aylanadi */
  ikpu_code: z.string(),
  package_code: z.string(),
  vat_percent: z.string(),
  units: z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  name: {},
  slug: '',
  icon: '',
  sort_order: 0,
  is_featured: false,
  description: {},
  image: '',
  ...EMPTY_FISCAL_FORM,
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const { t } = useTranslation()
  const { create, update } = useCategoryMutations()
  const isEditing = !!category

  /*
   * Ro'yxatdagi `category` da `name` faqat joriy tilda. Uni formaga qo'ysak,
   * saqlaganda qolgan ikki til shu tarjima bilan almashib ketardi — shuning
   * uchun tahrirlashda `?raw=true` bilan qayta olamiz.
   */
  const { data: raw, isLoading: isRawLoading } = useCategoryRaw(
    isOpen && category ? category.id : undefined,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  const { control, handleSubmit, reset, setValue, register } = form
  const imageValue = useWatch({ control, name: 'image' })

  useEffect(() => {
    if (!isOpen) return

    if (!category) {
      reset(EMPTY)
      return
    }

    // `raw` kelguncha forma bo'sh turadi (yuklanish holati ko'rsatiladi)
    if (!raw) return

    reset({
      name: fromRaw(raw, 'name'),
      slug: raw.slug ?? '',
      icon: raw.icon ?? '',
      sort_order: raw.sort_order ?? 0,
      is_featured: raw.is_featured ?? false,
      description: fromRaw(raw, 'description'),
      image: raw.image ?? '',
      ...fiscalToForm(raw),
    })
  }, [isOpen, category, raw, reset])

  const onSubmit = handleSubmit((values) => {
    const name = cleanLocalized(values.name as Localized)
    if (!name) return

    const payload: CategoryInput = {
      name,
      slug: values.slug?.trim() || undefined,
      icon: values.icon?.trim() || null,
      sort_order: values.sort_order ? Number(values.sort_order) : 0,
      is_featured: !!values.is_featured,
      description: cleanLocalized(values.description as Localized),
      image: values.image || undefined,
      ...fiscalFromForm(values),
    }

    const onError = (err: unknown) => toast.error(errorMessage(err, t('error.generic')))

    if (isEditing && category) {
      update.mutate(
        { id: category.id, body: payload },
        {
          onSuccess: () => {
            toast.success(t('category.updated'))
            onClose()
          },
          onError,
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success(t('category.created'))
          onClose()
        },
        onError,
      })
    }
  })

  const isPending = create.isPending || update.isPending

  return (
    <MyModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      header={isEditing ? t('category.editCategory') : t('category.addCategory')}
      size="lg"
    >
      {isEditing && isRawLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('common.loading')}
        </div>
      ) : (
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="space-y-4 pt-2">
            <LocalizedField
              control={control}
              name="name"
              label={t('category.name')}
              placeholder={t('category.namePlaceholder')}
              required
              hint={t('category.localizedHint')}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="slug"
                label={t('category.slug')}
                placeholder={t('category.slugPlaceholder')}
              />

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="icon"
                label={t('category.icon')}
                placeholder="uploads/icons/tools.svg"
              />

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="sort_order"
                type="number"
                label={t('category.sortOrder')}
              />
            </div>

            <LocalizedField
              control={control}
              name="description"
              label={t('category.description')}
              placeholder={t('category.descriptionPlaceholder')}
              multiline
            />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="mt-0.5 size-4 rounded border-input accent-brand"
              />
              <span className="space-y-0.5">
                <span className="block text-xs font-medium text-foreground">
                  {t('category.isFeatured')}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {t('category.isFeaturedHint')}
                </span>
              </span>
            </label>

            {/*
              Fiskal kodlarning ASOSIY joyi shu yer: bitta kategoriyani
              to'ldirsangiz ichidagi hamma mahsulot qamraladi.
            */}
            <FiscalSection
              title={t('fiscal.title')}
              description={t('fiscal.categoryHint')}
            />

            <Field label={t('category.image')}>
              <ImageUpload
                value={imageValue}
                onChange={(val) =>
                  setValue('image', typeof val === 'string' ? val : val[0], {
                    shouldDirty: true,
                  })
                }
              />
            </Field>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                {t('common.cancel')}
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {t('common.saving')}
                  </>
                ) : isEditing ? (
                  t('common.save')
                ) : (
                  t('common.create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </MyModal>
  )
}
