import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { ThemeToggle } from 'dgz-ui-shared/components/theme'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Store, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { authApi, LoginError } from './api'
import { useLogin } from './hooks'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { controlClass } from '@/components/ui/Field'
import { setLanguage, storedLanguage } from '@/i18n'
import { cn, errorMessage } from '@/lib/utils'

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  // Reset password state
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetStep, setResetStep] = useState<'send_otp' | 'verify_otp'>('send_otp')
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  /* Backend qoidalari: email formati + parol kamida 6 belgi (LoginDto). */
  const schema = z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(6, t('auth.validation.passwordMin')),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  const { control, handleSubmit } = form

  const failure =
    login.error instanceof LoginError ? login.error.reason : login.error ? 'generic' : null

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-background p-4 sm:p-6">
      {/* Top right minimal utility controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
            <Store className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {t('common.appName')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher
            value={storedLanguage()}
            onSelect={(language) => setLanguage(language)}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Centered Minimalist Login Box */}
      <div className="mx-auto w-full max-w-sm sm:max-w-[400px] py-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          <Form {...form}>
            <form
              noValidate
              onSubmit={handleSubmit((values) => login.mutate(values))}
              className="space-y-4"
            >
              {failure ? (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{t(`auth.errors.${failure}`)}</span>
                </div>
              ) : null}

              <div className="space-y-3">
                <MyInput
                  control={control}
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />

                <div className="relative">
                  <MyInput
                    control={control}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    label={t('auth.password')}
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('send_otp')
                    setResetModalOpen(true)
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-lg text-sm font-medium"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" aria-hidden />
                      {t('auth.submitting')}
                    </>
                  ) : (
                    <>
                      <Lock className="size-4 mr-1.5" />
                      {t('auth.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Minimalist Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {t('auth.resetPassword')}
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {resetStep === 'send_otp' ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Email manzilingizni kiriting. Biz tasdiqlash kodini yuboramiz.
                </p>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className={controlClass}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full rounded-lg"
                  disabled={resetLoading || !resetEmail.trim()}
                  onClick={async () => {
                    setResetLoading(true)
                    try {
                      await authApi.forgotPassword(resetEmail.trim())
                      toast.success(t('auth.otpSent'))
                      setResetStep('verify_otp')
                    } catch (err) {
                      toast.error(errorMessage(err, t('error.generic')))
                    } finally {
                      setResetLoading(false)
                    }
                  }}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('auth.sendOtp')
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Emailingizga yuborilgan 6 xonali kod va yangi parolni kiriting.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      {t('auth.code')}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className={cn(controlClass, 'text-center font-mono tracking-widest')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      {t('auth.newPassword')}
                    </label>
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder={t('auth.newPasswordPlaceholder')}
                      className={controlClass}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-lg flex-1"
                    onClick={() => setResetStep('send_otp')}
                    disabled={resetLoading}
                  >
                    {t('common.back')}
                  </Button>

                  <Button
                    type="button"
                    className="rounded-lg flex-1"
                    disabled={resetLoading || resetCode.length < 4 || resetNewPassword.length < 6}
                    onClick={async () => {
                      setResetLoading(true)
                      try {
                        await authApi.resetPassword(resetEmail.trim(), resetCode.trim(), resetNewPassword)
                        toast.success(t('auth.passwordResetSuccess'))
                        setResetModalOpen(false)
                        setResetCode('')
                        setResetNewPassword('')
                      } catch (err) {
                        toast.error(errorMessage(err, t('error.generic')))
                      } finally {
                        setResetLoading(false)
                      }
                    }}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('auth.resetPassword')
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer minimal info */}
      <div className="text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {t('common.appName')}. {t('common.adminHub')}</span>
      </div>
    </div>
  )
}
