import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from 'dgz-ui/badge'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import { Loader2, UserCircle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { ChangePasswordCard } from './ChangePasswordCard'
import { useUpdateProfile } from './hooks'
import { PageHeader } from '@/components/layout/PageHeader'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { SectionCard } from '@/components/ui/SectionCard'
import { RoleBadge } from '@/components/ui/StatusBadge'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useProfile } from '@/features/auth/hooks'
import { LANGUAGES, setLanguage } from '@/i18n'
import type { Language } from '@/lib/types'
import { cn, errorMessage, formatDate } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().max(120).optional(),
  phone: z.string().max(32).optional(),
  /* Rasm ham forma holatida — alohida useState + useEffect kerak bo'lmaydi. */
  photo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: user, isLoading, isError, error, refetch } = useProfile()
  const updateProfile = useUpdateProfile()

  // `My*` komponentlari `useFormContext()` ga tayanadi — `Form` bilan o'raladi.
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', photo: undefined },
    /*
     * `values` — ma'lumot kelgach RHF formani o'zi to'ldiradi. `useEffect` +
     * `reset` shart emas (va effekt ichida setState chaqirilmaydi).
     */
    values: user
      ? {
          full_name: user.full_name ?? '',
          phone: user.phone ?? '',
          photo: user.photo,
        }
      : undefined,
  })
  const { control, handleSubmit, setValue } = form

  // `useWatch` — `watch()` dan farqli, React Compiler bilan mos keladi.
  const photo = useWatch({ control, name: 'photo' })

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(
      {
        full_name: values.full_name?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        photo: values.photo,
      },
      {
        onSuccess: () => toast.success(t('profile.updated')),
        onError: (mutationError) =>
          toast.error(errorMessage(mutationError, t('profile.updateFailed'))),
      },
    )
  })

  const handleLanguage = (language: Language) => {
    setLanguage(language)
    updateProfile.mutate({ language })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !user) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('profile.title')} description={t('profile.subtitle')} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title={t('profile.personalInfo')}
            description={t('profile.personalInfoHint')}
            icon={UserCircle}
          >
            <Form {...form}>
              <form noValidate onSubmit={onSubmit} className="space-y-6">
                <AvatarUpload
                  value={photo}
                  onChange={(path) =>
                    setValue('photo', path, { shouldDirty: true })
                  }
                  name={user.full_name}
                  email={user.email}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <MyInput
                    control={control}
                    name="full_name"
                    label={t('profile.fullName')}
                    placeholder={t('profile.fullNamePlaceholder')}
                  />
                  <MyInput
                    control={control}
                    name="phone"
                    label={t('profile.phone')}
                    placeholder={t('profile.phonePlaceholder')}
                  />
                </div>

                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      {t('common.saving')}
                    </>
                  ) : (
                    t('common.save')
                  )}
                </Button>
              </form>
            </Form>
          </SectionCard>

          <ChangePasswordCard />
        </div>

        <div className="space-y-6">
          <SectionCard
            title={t('profile.email')}
            description={t('profile.emailHint')}
            contentClassName="space-y-4 p-5 pt-0 text-sm"
          >
            <p className="break-all font-medium text-foreground">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <Badge
                type="status"
                variant={user.is_verified ? 'green' : 'orange'}
                rounded="full"
              >
                {user.is_verified ? t('profile.verified') : t('profile.notVerified')}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">{t('profile.roleHint')}</p>

            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              {t('profile.memberSince')}: {formatDate(user.created_at)}
            </div>
          </SectionCard>

          <SectionCard
            title={t('profile.language')}
            description={t('profile.languageHint')}
          >
            <div
              role="radiogroup"
              aria-label={t('profile.language')}
              className="grid gap-2"
            >
              {LANGUAGES.map((language) => {
                const active = user.language === language

                return (
                  <button
                    key={language}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleLanguage(language)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
                      active
                        ? 'border-brand bg-brand-muted font-medium text-brand'
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {t(`language.${language}`)}
                    <span className="text-xs uppercase">{language}</span>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
