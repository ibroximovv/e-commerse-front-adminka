import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { AlertCircle, Loader2, Store } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { LoginError } from './api'
import { useLogin } from './hooks'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { setLanguage, storedLanguage } from '@/i18n'

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()

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

  /*
   * `My*` komponentlari ichida `useFormContext()` chaqiriladi, shuning uchun
   * ular `Form` (FormProvider) ichida bo'lishi SHART — faqat `control` uzatish
   * yetarli emas (paket README'sidagi namuna shu joyda noto'g'ri).
   */
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  const { control, handleSubmit } = form

  const failure =
    login.error instanceof LoginError ? login.error.reason : login.error ? 'generic' : null

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brend paneli — faqat kengroq ekranlarda */}
      <div className="relative hidden flex-col justify-between bg-brand p-10 text-brand-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-foreground/15">
            <Store className="size-[18px]" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {t('common.appName')}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            {t('auth.loginTitle')}
          </p>
          <p className="max-w-sm text-sm text-brand-foreground/70">{t('auth.loginSubtitle')}</p>
        </div>

        <div aria-hidden className="text-xs text-brand-foreground/50">
          © {new Date().getFullYear()}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-end p-4">
          <LanguageSwitcher
            value={storedLanguage()}
            onSelect={(language) => setLanguage(language)}
          />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand text-brand-foreground lg:hidden">
                <Store className="size-5" aria-hidden />
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t('auth.loginTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
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
                    className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{t(`auth.errors.${failure}`)}</span>
                  </div>
                ) : null}

                <MyInput
                  control={control}
                  name="email"
                  type="email"
                  autoComplete="email"
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />

                <MyInput
                  control={control}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  label={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                />

                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      {t('auth.submitting')}
                    </>
                  ) : (
                    t('auth.submit')
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
