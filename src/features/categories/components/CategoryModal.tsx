import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput, MyTextarea } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useCategoryMutations } from '../hooks'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { Category } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'category.validation.nameRequired'),
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

export function CategoryModal({
  isOpen,
  onClose,
  category,
  existingCategories = [],
}: CategoryModalProps) {
  const { t } = useTranslation()
  const { create, update } = useCategoryMutations()
  const isEditing = !!category

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
    },
  })

  const { control, handleSubmit, reset, setValue, setError } = form
  const imageValue = useWatch({ control, name: 'image' })

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description ?? '',
          image: category.image ?? '',
        })
      } else {
        reset({
          name: '',
          description: '',
          image: '',
        })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit = handleSubmit((values) => {
    const trimmedName = values.name.trim()

    // Frontend unique check
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
          <MyInput
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={control as any}
            name="name"
            label={t('category.name')}
            placeholder={t('category.namePlaceholder')}
            required
          />

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
