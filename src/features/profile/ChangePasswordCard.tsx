import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { KeyRound, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useChangePassword } from './hooks'
import { SectionCard } from '@/components/ui/SectionCard'
import { errorMessage } from '@/lib/utils'

export function ChangePasswordCard() {
  const { t } = useTranslation()
  const changePassword = useChangePassword()

  /* Backend: new_password >= 6 (ChangePasswordDto). Tasdiqlash maydoni faqat
     frontendda — backend uni bilmaydi. */
  const schema = z
    .object({
      old_password: z.string().min(1, t('profile.validation.oldRequired')),
      new_password: z.string().min(6, t('profile.validation.newMin')),
      confirm_password: z.string(),
    })
    .refine((values) => values.new_password === values.confirm_password, {
      path: ['confirm_password'],
      message: t('profile.validation.mismatch'),
    })
    .refine((values) => values.new_password !== values.old_password, {
      path: ['new_password'],
      message: t('profile.validation.sameAsOld'),
    })

  // `My*` komponentlari `useFormContext()` ga tayanadi — `Form` bilan o'raladi.
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { old_password: '', new_password: '', confirm_password: '' },
  })
  const { control, handleSubmit, reset } = form

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(
      { old_password: values.old_password, new_password: values.new_password },
      {
        onSuccess: () => {
          toast.success(t('profile.passwordChanged'))
          reset()
        },
        onError: (error) =>
          toast.error(errorMessage(error, t('profile.passwordFailed'))),
      },
    )
  })

  return (
    <SectionCard
      title={t('profile.security')}
      description={t('profile.securityHint')}
      icon={KeyRound}
    >
      <Form {...form}>
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <MyInput
            control={control}
            name="old_password"
            type="password"
            autoComplete="current-password"
            label={t('profile.oldPassword')}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <MyInput
              control={control}
              name="new_password"
              type="password"
              autoComplete="new-password"
              label={t('profile.newPassword')}
              required
            />
            <MyInput
              control={control}
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              label={t('profile.confirmPassword')}
              required
            />
          </div>

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('common.saving')}
              </>
            ) : (
              t('profile.changePassword')
            )}
          </Button>
        </form>
      </Form>
    </SectionCard>
  )
}
