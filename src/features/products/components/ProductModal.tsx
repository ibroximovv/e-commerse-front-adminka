import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput, MyTextarea } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useProductMutations } from '../hooks'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useCategories } from '@/features/categories/hooks'
import type { Category, Product } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'product.validation.nameRequired'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'product.validation.priceRequired'),
  stock: z.coerce.number().min(0, 'product.validation.stockInvalid'),
  category_id: z.string().min(1, 'product.validation.categoryRequired'),
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

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { t } = useTranslation()
  const { create, update } = useProductMutations()
  const { data: categoriesData } = useCategories(true)
  const rawCategories = categoriesData?.items
  const categories = useMemo(() => rawCategories ?? [], [rawCategories])

  const isEditing = !!product

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      images: [],
      attributes: [],
    },
  })

  const { control, handleSubmit, reset, setValue, register, formState: { errors } } = form
  const imagesValue = useWatch({ control, name: 'images' })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  })

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          images: product.images ?? [],
          attributes: product.attributes ?? [],
        })
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          category_id: categories.find((c: Category) => !c.is_archived)?.id ?? '',
          images: [],
          attributes: [],
        })
      }
    }
  }, [isOpen, product, reset, categories])

  const onSubmit = handleSubmit((values) => {
    // Filter out empty attribute pairs
    const validAttributes = (values.attributes ?? []).filter(
      (attr: { key: string; value: string }) => attr.key.trim() && attr.value.trim(),
    )

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price: Number(values.price),
      stock: Number(values.stock),
      category_id: values.category_id,
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('product.category')} <span className="text-destructive">*</span>
              </label>
              <select
                {...register('category_id')}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t('product.selectCategory')}</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.is_archived ? `(${t('category.archived')})` : ''}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-destructive">
                  {t(errors.category_id.message as string)}
                </p>
              )}
            </div>
          </div>

          <MyTextarea
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            name="description"
            label={t('product.description')}
            placeholder={t('product.descriptionPlaceholder')}
            rows={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
              name="stock"
              type="number"
              min="0"
              label={t('product.stock')}
              required
            />
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
