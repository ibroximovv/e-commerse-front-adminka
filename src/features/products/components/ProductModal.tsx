import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput, MyTextarea } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useProductMutations } from '../hooks'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useCategoryTree } from '@/features/categories/hooks'
import type { Category, Product } from '@/lib/types'
import { errorMessage, formatPrice } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'product.validation.nameRequired'),
  slug: z.string().optional(),
  sku: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'product.validation.priceRequired'),
  discount_price: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, 'product.validation.stockInvalid'),
  category_id: z.string().min(1, 'product.validation.categoryRequired'),
  is_top: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  images: z.array(z.string()),
  attributes: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
})

type FormValues = z.infer<typeof schema>

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

function flattenCategoryTree(
  cats: Category[],
  depth = 0,
): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = []
  for (const cat of cats) {
    result.push({ id: cat.id, name: `${'— '.repeat(depth)}${cat.name}` })
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoryTree(cat.children, depth + 1))
    }
  }
  return result
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { t } = useTranslation()
  const { create, update } = useProductMutations()
  const { data: treeData } = useCategoryTree({ include_archived: false })

  const categoryOptions = useMemo(() => {
    return treeData ? flattenCategoryTree(treeData) : []
  }, [treeData])

  const [tagInput, setTagInput] = useState('')
  const [tagsList, setTagsList] = useState<string[]>([])

  const isEditing = !!product

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      brand: '',
      description: '',
      price: 0,
      discount_price: null,
      stock: 0,
      category_id: '',
      is_top: false,
      is_featured: false,
      images: [],
      attributes: [],
    },
  })

  const { control, handleSubmit, reset, setValue, register, formState: { errors } } = form
  const imagesValue = useWatch({ control, name: 'images' })
  const priceValue = useWatch({ control, name: 'price' })
  const discountPriceValue = useWatch({ control, name: 'discount_price' })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  })

  // Calculated preview values
  const priceNum = Number(priceValue) || 0
  const discountNum = Number(discountPriceValue) || 0
  const hasDiscount = discountNum > 0 && discountNum < priceNum
  const calculatedDiscountPercent = hasDiscount
    ? Math.round(((priceNum - discountNum) / priceNum) * 100)
    : 0

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          slug: product.slug ?? '',
          sku: product.sku ?? '',
          brand: product.brand ?? '',
          description: product.description ?? '',
          price: product.price,
          discount_price: product.discount_price ?? null,
          stock: product.stock,
          category_id: product.category_id,
          is_top: product.is_top ?? false,
          is_featured: product.is_featured ?? false,
          images: product.images ?? [],
          attributes: product.attributes ?? [],
        })
        setTagsList(product.tags ?? [])
      } else {
        reset({
          name: '',
          slug: '',
          sku: '',
          brand: '',
          description: '',
          price: 0,
          discount_price: null,
          stock: 0,
          category_id: categoryOptions[0]?.id ?? '',
          is_top: false,
          is_featured: false,
          images: [],
          attributes: [],
        })
        setTagsList([])
      }
      setTagInput('')
    }
  }, [isOpen, product, reset, categoryOptions])

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList([...tagsList, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove))
  }

  const onSubmit = handleSubmit((values) => {
    // Validate discount price < price
    if (values.discount_price && Number(values.discount_price) >= Number(values.price)) {
      toast.error(t('product.validation.discountInvalid'))
      return
    }

    const validAttributes = (values.attributes ?? []).filter(
      (attr: { key: string; value: string }) => attr.key.trim() && attr.value.trim(),
    )

    const payload = {
      name: values.name.trim(),
      slug: values.slug?.trim() || undefined,
      sku: values.sku?.trim() || null,
      brand: values.brand?.trim() || null,
      tags: tagsList,
      description: values.description?.trim() || undefined,
      price: Number(values.price),
      discount_price: values.discount_price ? Number(values.discount_price) : null,
      stock: Number(values.stock),
      category_id: values.category_id,
      is_top: !!values.is_top,
      is_featured: !!values.is_featured,
      images: values.images ?? [],
      attributes: validAttributes,
    }

    if (isEditing && product) {
      update.mutate(
        { id: product.id, body: payload },
        {
          onSuccess: () => {
            toast.success(t('product.updated'))
            onClose()
          },
          onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success(t('product.created'))
          onClose()
        },
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
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
      <Form {...form}>
        <form noValidate onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="name"
              label={t('product.name')}
              placeholder={t('product.namePlaceholder')}
              required
            />

            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="slug"
              label={t('product.slug')}
              placeholder="e.g. iphone-15-pro (auto)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('product.category')} <span className="text-destructive">*</span>
              </label>
              <select
                {...register('category_id')}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t('product.selectCategory')}</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-destructive">
                  {t(errors.category_id.message as string)}
                </p>
              )}
            </div>

            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="brand"
              label={t('product.brand')}
              placeholder="e.g. Apple"
            />

            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="sku"
              label="SKU"
              placeholder="e.g. APP-IPH-15"
            />
          </div>

          <MyTextarea
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            name="description"
            label={t('product.description')}
            placeholder={t('product.descriptionPlaceholder')}
            rows={3}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="price"
              type="number"
              min="0"
              step="0.01"
              label={t('product.price')}
              required
            />

            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="discount_price"
              type="number"
              min="0"
              step="0.01"
              label={t('product.discountPrice')}
              placeholder="Sale price"
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

          {/* Calculated price preview */}
          {hasDiscount && (
            <div className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
              <span className="font-medium text-foreground">{t('product.finalPayablePrice')}:</span>
              <span className="text-sm font-bold text-brand">{formatPrice(discountNum)}</span>
              <span className="text-muted-foreground line-through">{formatPrice(priceNum)}</span>
              <span className="rounded bg-destructive px-1.5 py-0.5 font-bold text-destructive-foreground">
                -{calculatedDiscountPercent}% OFF
              </span>
            </div>
          )}

          {/* Flags checkboxes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              <input
                type="checkbox"
                id="is_top"
                {...register('is_top')}
                className="size-4 rounded border-input text-brand focus:ring-ring"
              />
              <label htmlFor="is_top" className="cursor-pointer text-sm font-medium text-foreground">
                🔥 {t('product.isTop')} (Admin TOP)
              </label>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border p-3">
              <input
                type="checkbox"
                id="is_featured"
                {...register('is_featured')}
                className="size-4 rounded border-input text-brand focus:ring-ring"
              />
              <label htmlFor="is_featured" className="cursor-pointer text-sm font-medium text-foreground">
                ✨ {t('product.isFeatured')}
              </label>
            </div>
          </div>

          {/* Tags input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{t('product.tags')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="e.g. 5g, gaming (press Enter)"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                {t('common.add')}
              </Button>
            </div>
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tagsList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-brand hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <ImageUpload
            value={imagesValue}
            onChange={(val) =>
              setValue('images', Array.isArray(val) ? val : [val], {
                shouldDirty: true,
              })
            }
            multiple
            maxCount={5}
            label={t('product.images')}
          />

          {/* Attributes Repeater */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t('product.attributes')}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ key: '', value: '' })}
              >
                <Plus className="size-4" aria-hidden />
                {t('product.addAttribute')}
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('common.none')}</p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...register(`attributes.${index}.key`)}
                      placeholder={t('product.attrKey')}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <input
                      {...register(`attributes.${index}.value`)}
                      placeholder={t('product.attrValue')}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
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
    </MyModal>
  )
}
