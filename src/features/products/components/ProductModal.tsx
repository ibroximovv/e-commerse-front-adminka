import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2, Receipt, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useController, useForm, useWatch, type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useProductMutations, useProductRaw } from '../hooks'
import type { ProductAttributeInput, ProductInput } from '../types'
import { AttributesEditor } from './AttributesEditor'
import { Field, NativeSelect, controlClass } from '@/components/ui/Field'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { LocalizedField } from '@/components/ui/LocalizedField'
import { useAllCategories } from '@/features/categories/hooks'
import { cleanLocalized, fromRaw, hasAnyLocale } from '@/lib/localized'
import type { Localized, Product } from '@/lib/types'
import { cn, errorMessage, formatPrice } from '@/lib/utils'

const localized = z.object({
  uz: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
})

const schema = z.object({
  name: localized.refine(hasAnyLocale, 'product.validation.nameRequired'),
  slug: z.string().optional(),
  sku: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  description: localized,
  price: z.coerce.number().min(0, 'product.validation.priceRequired'),
  discount_price: z.coerce.number().optional().nullable(),
  price_on_request: z.boolean(),
  stock: z.coerce.number().min(0, 'product.validation.stockInvalid'),
  category_id: z.string().min(1, 'product.validation.categoryRequired'),
  is_top: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  attributes: z.array(z.object({ key: localized, value: localized, unit: localized })),
  /* Fiskalizatsiya — satr sifatida saqlanadi, yuborishdan oldin songa aylanadi */
  ikpu_code: z.string().optional(),
  package_code: z.string().optional(),
  vat_percent: z.string().optional(),
  units: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  name: {},
  slug: '',
  sku: '',
  brand: '',
  description: {},
  price: 0,
  discount_price: null,
  price_on_request: false,
  stock: 0,
  category_id: '',
  is_top: false,
  is_featured: false,
  images: [],
  tags: [],
  attributes: [],
  ikpu_code: '',
  package_code: '',
  vat_percent: '',
  units: '',
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { t } = useTranslation()
  const { create, update } = useProductMutations()
  const { data: categories } = useAllCategories({ include_archived: false })
  const categoryOptions = categories ?? []

  const isEditing = !!product

  /* Tahrirlashda uchala til kerak — ro'yxatdagi obyektda faqat bittasi bor. */
  const { data: raw, isLoading: isRawLoading } = useProductRaw(
    isOpen && product ? product.id : undefined,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { errors },
  } = form

  const imagesValue = useWatch({ control, name: 'images' })
  const priceValue = useWatch({ control, name: 'price' })
  const discountPriceValue = useWatch({ control, name: 'discount_price' })
  const priceOnRequest = useWatch({ control, name: 'price_on_request' })

  const priceNum = Number(priceValue) || 0
  const discountNum = Number(discountPriceValue) || 0
  const hasDiscount = !priceOnRequest && discountNum > 0 && discountNum < priceNum
  const discountPercent = hasDiscount
    ? Math.round(((priceNum - discountNum) / priceNum) * 100)
    : 0

  useEffect(() => {
    if (!isOpen) return

    if (!product) {
      reset({ ...EMPTY, category_id: categories?.[0]?.id ?? '' })
      return
    }

    if (!raw) return

    reset({
      name: fromRaw(raw, 'name'),
      slug: raw.slug ?? '',
      sku: raw.sku ?? '',
      brand: raw.brand ?? '',
      description: fromRaw(raw, 'description'),
      price: raw.price,
      discount_price: raw.discount_price ?? null,
      price_on_request: raw.price_on_request ?? false,
      stock: raw.stock,
      category_id: raw.category_id,
      is_top: raw.is_top ?? false,
      is_featured: raw.is_featured ?? false,
      images: raw.images ?? [],
      tags: raw.tags ?? [],
      attributes: (raw.attributes ?? []).map((attr) => ({
        key: fromRaw(attr, 'key'),
        value: fromRaw(attr, 'value'),
        unit: fromRaw(attr, 'unit'),
      })),
      ikpu_code: raw.ikpu_code ?? '',
      package_code: raw.package_code ?? '',
      vat_percent: raw.vat_percent == null ? '' : String(raw.vat_percent),
      units: raw.units == null ? '' : String(raw.units),
    })
  }, [isOpen, product, raw, reset, categories])

  const onSubmit = handleSubmit((values) => {
    const name = cleanLocalized(values.name as Localized)
    if (!name) return

    const onRequest = values.price_on_request
    const price = onRequest ? 0 : Number(values.price)
    const discount =
      !onRequest && values.discount_price ? Number(values.discount_price) : null

    if (discount !== null && discount >= price) {
      toast.error(t('product.validation.discountInvalid'))
      return
    }

    /*
     * `key` yoki `value` hech bir tilda to'ldirilmagan qatorlarni tashlaymiz —
     * ular fasetda "bo'sh" guruh hosil qiladi.
     */
    const attributes = values.attributes.reduce<ProductAttributeInput[]>((acc, attr) => {
      const key = cleanLocalized(attr.key as Localized)
      const value = cleanLocalized(attr.value as Localized)
      if (!key || !value) return acc

      acc.push({ key, value, unit: cleanLocalized(attr.unit as Localized) })
      return acc
    }, [])

    const payload: ProductInput = {
      name,
      slug: values.slug?.trim() || undefined,
      sku: values.sku?.trim() || null,
      brand: values.brand?.trim() || null,
      tags: values.tags,
      description: cleanLocalized(values.description as Localized),
      price,
      discount_price: discount,
      price_on_request: onRequest,
      stock: Number(values.stock),
      category_id: values.category_id,
      is_top: !!values.is_top,
      is_featured: !!values.is_featured,
      images: values.images ?? [],
      // PATCH da atributlar TO'LIQ almashtiriladi — massivni butunlay yuboramiz
      attributes,
      ikpu_code: values.ikpu_code?.trim() || null,
      package_code: values.package_code?.trim() || null,
      vat_percent: values.vat_percent ? Number(values.vat_percent) : null,
      units: values.units?.trim() ? Number(values.units) : null,
    }

    const onError = (err: unknown) => toast.error(errorMessage(err, t('error.generic')))

    if (isEditing && product) {
      update.mutate(
        { id: product.id, body: payload },
        {
          onSuccess: () => {
            toast.success(t('product.updated'))
            onClose()
          },
          onError,
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success(t('product.created'))
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
      header={isEditing ? t('product.editProduct') : t('product.addProduct')}
      size="2xl"
    >
      {isEditing && isRawLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('common.loading')}
        </div>
      ) : (
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="space-y-5 pt-2">
            <LocalizedField
              control={control}
              name="name"
              label={t('product.name')}
              placeholder={t('product.namePlaceholder')}
              required
              hint={t('product.localizedHint')}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t('product.category')}
                required
                error={
                  errors.category_id ? t(errors.category_id.message as string) : undefined
                }
              >
                <NativeSelect {...register('category_id')}>
                  <option value="">{t('product.selectCategory')}</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="slug"
                label={t('product.slug')}
                placeholder={t('product.slugPlaceholder')}
              />

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="brand"
                label={t('product.brand')}
                placeholder="OCO"
              />

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="sku"
                label="SKU"
                placeholder="1WZB-250"
              />
            </div>

            <LocalizedField
              control={control}
              name="description"
              label={t('product.description')}
              placeholder={t('product.descriptionPlaceholder')}
              multiline
            />

            {/* ── Narx ─────────────────────────────────────────────── */}
            <section className="space-y-3 rounded-xl border border-border p-4">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  {...register('price_on_request')}
                  className="mt-0.5 size-4 rounded border-input accent-brand"
                />
                <span className="space-y-0.5">
                  <span className="block text-xs font-medium text-foreground">
                    {t('product.priceOnRequest')}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t('product.priceOnRequestHint')}
                  </span>
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('product.price')}
                  disabled={priceOnRequest}
                  required={!priceOnRequest}
                />

                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="discount_price"
                  type="number"
                  min="0"
                  step="0.01"
                  label={t('product.discountPrice')}
                  disabled={priceOnRequest}
                />

                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="stock"
                  type="number"
                  min="0"
                  label={t('product.stock')}
                  required
                />
              </div>

              {hasDiscount ? (
                <div className="flex flex-wrap items-center gap-2.5 rounded-lg bg-brand-muted px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    {t('product.finalPayablePrice')}
                  </span>
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(discountNum)}
                  </span>
                  <span className="text-muted-foreground line-through">
                    {formatPrice(priceNum)}
                  </span>
                  <span className="rounded-full bg-destructive px-1.5 py-0.5 font-semibold text-destructive-foreground">
                    −{discountPercent}%
                  </span>
                </div>
              ) : null}
            </section>

            {/* ── Belgilar ─────────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { name: 'is_top', label: t('product.isTop') },
                  { name: 'is_featured', label: t('product.isFeatured') },
                ] as const
              ).map((flag) => (
                <label
                  key={flag.name}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                >
                  <input
                    type="checkbox"
                    {...register(flag.name)}
                    className="size-4 rounded border-input accent-brand"
                  />
                  <span className="text-xs font-medium text-foreground">{flag.label}</span>
                </label>
              ))}
            </div>

            {/* ── Teglar ───────────────────────────────────────────── */}
            {/* key — boshqa mahsulotga o'tilganda yozib qo'yilgan tegni tozalaydi */}
            <TagsField key={product?.id ?? 'new'} control={control} />

            <Field label={t('product.images')}>
              <ImageUpload
                value={imagesValue}
                onChange={(val) =>
                  setValue('images', Array.isArray(val) ? val : [val], {
                    shouldDirty: true,
                  })
                }
                multiple
                maxCount={5}
              />
            </Field>

            <AttributesEditor control={control} name="attributes" />

            {/* ── Fiskalizatsiya ───────────────────────────────────── */}
            <section className="space-y-3 rounded-xl border border-border p-4">
              <div className="flex items-start gap-2">
                <Receipt className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div>
                  <h3 className="text-xs font-medium text-foreground">
                    {t('product.fiscal.title')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t('product.fiscal.hint')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="ikpu_code"
                  label={t('product.fiscal.ikpuCode')}
                  placeholder="08471001001000000"
                />

                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="package_code"
                  label={t('product.fiscal.packageCode')}
                  placeholder="1501886"
                />

                <Field label={t('product.fiscal.vatPercent')}>
                  <NativeSelect {...register('vat_percent')}>
                    <option value="">{t('product.fiscal.fromEnv')}</option>
                    <option value="0">0%</option>
                    <option value="12">12%</option>
                  </NativeSelect>
                </Field>

                <MyInput
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="units"
                  label={t('product.fiscal.units')}
                  placeholder="241092"
                />
              </div>
            </section>

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

/**
 * Teglar — forma maydonining o'zida (`tags`), shuning uchun `reset()` ularni
 * ham tiklaydi. Yozilayotgan matn esa faqat shu komponentda: modal qaytadan
 * ochilganda parent `key` orqali uni tozalaydi.
 */
function TagsField({ control }: { control: Control<FormValues> }) {
  const { t } = useTranslation()
  const { field } = useController({ control, name: 'tags' })
  const [draft, setDraft] = useState('')

  const tags = field.value ?? []

  const addTag = () => {
    const trimmed = draft.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed)) return
    field.onChange([...tags, trimmed])
    setDraft('')
  }

  return (
    <Field label={t('product.tags')}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={t('product.tagsPlaceholder')}
          className={cn(controlClass, 'flex-1')}
        />
        <Button type="button" variant="secondary" size="sm" onClick={addTag}>
          {t('common.add')}
        </Button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => field.onChange(tags.filter((x) => x !== tag))}
                className="text-muted-foreground transition-colors hover:text-destructive"
                aria-label={`${t('common.delete')} ${tag}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </Field>
  )
}
