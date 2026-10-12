import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { ThemeToggle } from 'dgz-ui-shared/components/theme'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Store } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { LoginError } from './api'
import { useLogin } from './hooks'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { setLanguage, storedLanguage } from '@/i18n'
import { isValidPhone, normalizePhone } from '@/lib/phone'

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  /*
   * Admin logs in with phone + password (full_name is only for customers).
   * Password length is not checked here: old admin passwords may be < 8 and
   * the 8-char rule only applies to change-password.
   */
  const schema = z.object({
    phone: z
      .string()
      .min(1, t('auth.validation.phoneRequired'))
      .refine(isValidPhone, t('auth.validation.phoneInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
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
              onSubmit={handleSubmit((values) =>
                login.mutate({ phone: normalizePhone(values.phone) ?? values.phone, password: values.password }),
              )}
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
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  label={t('auth.phone')}
                  placeholder={t('auth.phonePlaceholder')}
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
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
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

      {/* Footer minimal info */}
      <div className="text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {t('common.appName')}. {t('common.adminHub')}</span>
      </div>
    </div>
  )
}
