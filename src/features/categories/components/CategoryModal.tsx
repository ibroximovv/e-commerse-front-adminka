import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput, MyTextarea } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useCategoryMutations, useCategoryTree } from '../hooks'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { Category } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'category.validation.nameRequired'),
  slug: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sort_order: z.coerce.number().optional(),
  is_featured: z.boolean().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  existingCategories?: Category[]
}

/** Flatten category tree for select options with depth indentation */
function flattenCategoryTree(
  cats: Category[],
  depth = 0,
  currentId?: string,
): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = []
  for (const cat of cats) {
    if (cat.id === currentId) continue // exclude self
    result.push({ id: cat.id, name: `${'— '.repeat(depth)}${cat.name}`, depth })
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategoryTree(cat.children, depth + 1, currentId))
    }
  }
  return result
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  existingCategories = [],
}: CategoryModalProps) {
  const { t } = useTranslation()
  const { create, update } = useCategoryMutations()
  const { data: treeData } = useCategoryTree({ include_archived: true })
  const isEditing = !!category

  const parentOptions = useMemo(() => {
    const tree = treeData ?? []
    if (tree.length > 0) {
      return flattenCategoryTree(tree, 0, category?.id)
    }
    return existingCategories
      .filter((cat) => cat.id !== category?.id)
      .map((cat) => ({ id: cat.id, name: cat.name, depth: 0 }))
  }, [treeData, existingCategories, category])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      parent_id: null,
      icon: '',
      sort_order: 0,
      is_featured: false,
      description: '',
      image: '',
    },
  })

  const { control, handleSubmit, reset, setValue, setError, register } = form
  const imageValue = useWatch({ control, name: 'image' })

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug ?? '',
          parent_id: category.parent_id ?? null,
          icon: category.icon ?? '',
          sort_order: category.sort_order ?? 0,
          is_featured: category.is_featured ?? false,
          description: category.description ?? '',
          image: category.image ?? '',
        })
      } else {
        reset({
          name: '',
          slug: '',
          parent_id: null,
          icon: '',
          sort_order: 0,
          is_featured: false,
          description: '',
          image: '',
        })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit = handleSubmit((values) => {
    const trimmedName = values.name.trim()

    // Frontend unique name check
    const isDuplicate = existingCategories.some(
      (cat) =>
        cat.id !== category?.id &&
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )

    if (isDuplicate) {
      setError('name', {
        type: 'manual',
        message: t('category.validation.nameExists'),
      })
      return
    }

    const payload = {
      name: trimmedName,
      slug: values.slug?.trim() || undefined,
      parent_id: values.parent_id || null,
      icon: values.icon?.trim() || null,
      sort_order: values.sort_order ? Number(values.sort_order) : 0,
      is_featured: !!values.is_featured,
      description: values.description?.trim() || undefined,
      image: values.image || undefined,
    }

    if (isEditing && category) {
      update.mutate(
        { id: category.id, body: payload },
        {
          onSuccess: () => {
            toast.success(t('category.updated'))
            onClose()
          },
          onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
        },
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success(t('category.created'))
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
      header={isEditing ? t('category.editCategory') : t('category.addCategory')}
      size="lg"
    >
      <Form {...form}>
        <form noValidate onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="name"
              label={t('category.name')}
              placeholder={t('category.namePlaceholder')}
              required
            />

            <MyInput
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={control as any}
              name="slug"
              label={t('category.slug')}
              placeholder="e.g. electronics (auto)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('category.parentCategory')}
              </label>
              <select
                {...register('parent_id')}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t('category.noParent')}</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="icon"
                label={t('category.icon')}
                placeholder="e.g. smartphone"
              />

              <MyInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="sort_order"
                type="number"
                label={t('category.sortOrder')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border p-3">
            <input
              type="checkbox"
              id="is_featured"
              {...register('is_featured')}
              className="size-4 rounded border-input text-brand focus:ring-ring"
            />
            <label htmlFor="is_featured" className="cursor-pointer text-sm font-medium text-foreground">
              {t('category.isFeatured')}
            </label>
          </div>

          <MyTextarea
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            name="description"
            label={t('category.description')}
            placeholder={t('category.descriptionPlaceholder')}
            rows={3}
          />

          <ImageUpload
            value={imageValue}
            onChange={(val) =>
              setValue('image', typeof val === 'string' ? val : val[0], {
                shouldDirty: true,
              })
            }
            label={t('category.image')}
          />

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
