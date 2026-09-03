import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from 'dgz-ui/badge'
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
import { useUserMutations } from '../hooks'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { LANGUAGES } from '@/i18n'
import type { Language, Role, User } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().max(120).optional(),
  phone: z.string().max(32).optional(),
  photo: z.string().optional(),
  language: z.enum(['uz', 'ru', 'en']),
  role: z.enum(['ADMIN', 'USER']),
})

type FormValues = z.infer<typeof schema>

export function UserModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user?: User | null
}) {
  const { t } = useTranslation()
  const { update, updateRole } = useUserMutations()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      phone: '',
      photo: undefined,
      language: 'uz',
      role: 'USER',
    },
  })

  const { control, handleSubmit, reset, setValue } = form
  const photo = useWatch({ control, name: 'photo' })
  const language = useWatch({ control, name: 'language' })
  const role = useWatch({ control, name: 'role' })

  useEffect(() => {
    if (isOpen && user) {
      reset({
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        photo: user.photo,
        language: user.language,
        role: user.role,
      })
    }
  }, [isOpen, user, reset])

  const isSaving = update.isPending || updateRole.isPending

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return

    try {
      if (values.role !== user.role) {
        await updateRole.mutateAsync({ id: user.id, role: values.role })
      }

      await update.mutateAsync({
        id: user.id,
        body: {
          full_name: values.full_name?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          photo: values.photo,
          language: values.language,
        },
      })

      toast.success(t('user.updated'))
      onClose()
    } catch (err) {
      toast.error(errorMessage(err, t('error.generic')))
    }
  })

  return (
    <MyModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      header={t('user.editUser')}
      size="lg"
    >
      {user ? (
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="space-y-5 pt-2">
            <AvatarUpload
              value={photo}
              onChange={(path) => setValue('photo', path, { shouldDirty: true })}
              name={user.full_name}
              email={user.email}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <MyInput
                control={control}
                name="full_name"
                label={t('user.name')}
                placeholder={t('profile.fullNamePlaceholder')}
              />
              <MyInput
                control={control}
                name="phone"
                label={t('user.phone')}
                placeholder={t('profile.phonePlaceholder')}
              />
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                {t('user.role')}
              </span>
              <div role="radiogroup" aria-label={t('user.role')} className="flex gap-2">
                {(['USER', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={role === r}
                    onClick={() => setValue('role', r, { shouldDirty: true })}
                    className={
                      role === r
                        ? 'flex-1 rounded-xl border border-brand bg-brand/10 px-3 py-2 text-sm font-bold text-brand shadow-xs'
                        : 'flex-1 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  >
                    {t(`role.${r}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                {t('user.language')}
              </span>
              <div role="radiogroup" aria-label={t('user.language')} className="flex gap-2">
                {LANGUAGES.map((code: Language) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={language === code}
                    onClick={() => setValue('language', code, { shouldDirty: true })}
                    className={
                      language === code
                        ? 'flex-1 rounded-xl border border-brand bg-brand-muted px-3 py-2 text-sm font-medium text-brand'
                        : 'flex-1 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  >
                    {t(`language.${code}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-editable fields */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t('user.email')}</span>
                <span className="break-all text-right font-medium text-foreground font-mono">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t('user.verification')}</span>
                <Badge
                  type="status"
                  variant={user.is_verified ? 'green' : 'orange'}
                  rounded="full"
                >
                  {user.is_verified ? t('profile.verified') : t('profile.notVerified')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {t('common.saving')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </MyModal>
  )
}
