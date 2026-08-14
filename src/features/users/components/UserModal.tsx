import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { MyModal } from 'dgz-ui-shared/components/modal'
import { Info, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useUserMutations } from '../hooks'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { RoleBadge } from '@/components/ui/StatusBadge'
import { LANGUAGES } from '@/i18n'
import type { Language, User } from '@/lib/types'
import { errorMessage } from '@/lib/utils'

/* Backend DTO'sida faqat shu maydonlar bor — `role`, `email`, `is_verified` yo'q. */
const schema = z.object({
  full_name: z.string().max(120).optional(),
  phone: z.string().max(32).optional(),
  photo: z.string().optional(),
  language: z.enum(['uz', 'ru', 'en']),
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
  const { update } = useUserMutations()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', photo: undefined, language: 'uz' },
  })

  const { control, handleSubmit, reset, setValue } = form
  const photo = useWatch({ control, name: 'photo' })
  const language = useWatch({ control, name: 'language' })

  useEffect(() => {
    if (isOpen && user) {
      reset({
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        photo: user.photo,
        language: user.language,
      })
    }
  }, [isOpen, user, reset])

  const onSubmit = handleSubmit((values) => {
    if (!user) return

    update.mutate(
      {
        id: user.id,
        body: {
          full_name: values.full_name?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          photo: values.photo,
          language: values.language,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('user.updated'))
          onClose()
        },
        onError: (err) => toast.error(errorMessage(err, t('error.generic'))),
      },
    )
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
                        ? 'flex-1 rounded-lg border border-brand bg-brand-muted px-3 py-2 text-sm font-medium text-brand'
                        : 'flex-1 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
                    }
                  >
                    {t(`language.${code}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tahrirlanmaydigan maydonlar — nega ekanligi bilan birga */}
            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t('user.email')}</span>
                <span className="break-all text-right font-medium text-foreground">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t('user.role')}</span>
                <RoleBadge role={user.role} />
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

              <p className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <Info className="mt-px size-3.5 shrink-0" aria-hidden />
                {t('user.readOnlyHint')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={update.isPending}
              >
                {t('common.cancel')}
              </Button>

              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? (
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
