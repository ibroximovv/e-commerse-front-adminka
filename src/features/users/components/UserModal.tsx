import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useUserMutations } from '../hooks'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { LANGUAGES } from '@/i18n'
import { isValidPhone, normalizePhone } from '@/lib/phone'
import type { Language, Role, User } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

type FormValues = {
  full_name: string
  phone: string
  photo?: string
  language: Language
  role: Role
}

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

  /*
   * Phone + name are the customer's login credentials. Phone stays optional:
   * legacy users migrated without a phone can't log in until an admin adds one.
   */
  const schema = z.object({
    full_name: z.string().trim().min(2, t('user.validation.nameMin')).max(100),
    phone: z
      .string()
      .refine((v) => !v.trim() || isValidPhone(v), t('auth.validation.phoneInvalid')),
    photo: z.string().optional(),
    language: z.enum(['uz', 'ru', 'en']),
    role: z.enum(['ADMIN', 'USER']),
  })

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
  const fullName = useWatch({ control, name: 'full_name' })
  const phone = useWatch({ control, name: 'phone' })
  const isCredentialChanged =
    !!user &&
    (normalizePhone(phone) !== normalizePhone(user.phone) ||
      fullName.trim() !== (user.full_name ?? '').trim())

  useEffect(() => {
    if (isOpen && user) {
      reset({
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        photo: user.photo ?? undefined,
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
          full_name: values.full_name.trim(),
          // Empty = leave as is; the API has no way to clear a phone.
          phone: normalizePhone(values.phone) ?? undefined,
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
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <MyInput
                control={control}
                name="full_name"
                label={t('user.name')}
                placeholder={t('profile.fullNamePlaceholder')}
                required
              />
              <MyInput
                control={control}
                name="phone"
                type="tel"
                inputMode="tel"
                label={t('user.phone')}
                placeholder={t('profile.phonePlaceholder')}
              />
            </div>

            {isCredentialChanged ? (
              <p
                role="status"
                className="flex items-start gap-2 rounded-lg border border-border bg-warning-muted p-2.5 text-xs text-warning"
              >
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {t('user.credentialsChangeWarning')}
              </p>
            ) : null}

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
