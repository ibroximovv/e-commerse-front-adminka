import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { KeyRound, Loader2, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
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

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  /* Backend: new_password >= 6 (ChangePasswordDto). */
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
          <div className="relative">
            <MyInput
              control={control}
              name="old_password"
              type={showOld ? 'text' : 'password'}
              autoComplete="current-password"
              label={t('profile.oldPassword')}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <MyInput
                control={control}
                name="new_password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                label={t('profile.newPassword')}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <MyInput
                control={control}
                name="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                label={t('profile.confirmPassword')}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Parol kamida 6 ta belgidan iborat bo'lishi va avvalgi paroldan farq qilishi lozim.</span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="rounded-xl font-medium"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Lock className="size-4 mr-1.5" />
                  {t('profile.changePassword')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </SectionCard>
  )
}

