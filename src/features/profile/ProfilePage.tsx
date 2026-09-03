import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import {
  Calendar,
  Check,
  Globe,
  Loader2,
  Mail,
  Shield,
  ShieldCheck,
  UserCircle,
  Save,
} from 'lucide-react'
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
import { LANGUAGES } from '@/i18n'
import { useChangeLanguage } from '@/i18n/useChangeLanguage'
import type { Language } from '@/lib/types'
import { cn, errorMessage, formatDate, formatDateTime } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().max(120).optional(),
  phone: z.string().max(32).optional(),
  photo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const LANGUAGE_FLAGS: Record<Language, string> = {
  uz: "🇺🇿 O'zbekcha",
  ru: '🇷🇺 Русский',
  en: '🇬🇧 English',
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: user, isLoading, isError, error, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const changeLanguage = useChangeLanguage()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', photo: undefined },
    values: user
      ? {
          full_name: user.full_name ?? '',
          phone: user.phone ?? '',
          photo: user.photo,
        }
      : undefined,
  })
  const { control, handleSubmit, setValue, formState: { isDirty } } = form

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
    changeLanguage(language)
    updateProfile.mutate({ language })
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return <ErrorState error={error} onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('profile.title')} description={t('profile.subtitle')} />

      {/* Profile Header Card */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <AvatarUpload
            value={photo}
            onChange={(path) => setValue('photo', path, { shouldDirty: true })}
            name={user.full_name}
            email={user.email}
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {user.full_name || t('user.noName')}
              </h2>
              <RoleBadge role={user.role} />
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.2 text-[11px] font-medium ${
                  user.is_verified
                    ? 'bg-muted text-foreground'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                <ShieldCheck className="size-3" />
                {user.is_verified ? t('profile.verified') : t('profile.notVerified')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="size-3 text-muted-foreground" />
                {user.email}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {t('profile.memberSince')}: {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left 2 columns: Personal info form and password change */}
        <div className="space-y-5 lg:col-span-2">
          <SectionCard
            title={t('profile.personalInfo')}
            description={t('profile.personalInfoHint')}
            icon={UserCircle}
          >
            <Form {...form}>
              <form noValidate onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-3.5 sm:grid-cols-2">
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

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {isDirty ? 'O\'zgarishlar kiritildi' : `Oxirgi yangilanish: ${formatDateTime(user.updated_at)}`}
                  </span>

                  <Button
                    type="submit"
                    className="rounded-lg text-xs font-medium"
                    disabled={updateProfile.isPending || !isDirty}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1" aria-hidden />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5 mr-1" />
                        {t('common.save')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </SectionCard>

          <ChangePasswordCard />
        </div>

        {/* Right column: Language Selector and System RBAC card */}
        <div className="space-y-5">
          <SectionCard
            title={t('profile.language')}
            description={t('profile.languageHint')}
            icon={Globe}
          >
            <div
              role="radiogroup"
              aria-label={t('profile.language')}
              className="grid gap-2 pt-1"
            >
              {LANGUAGES.map((language) => {
                const active = (user.language || 'uz') === language

                return (
                  <button
                    key={language}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleLanguage(language)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-2.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{LANGUAGE_FLAGS[language]}</span>
                    </div>
                    {active ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-muted-foreground opacity-60">
                        {language}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </SectionCard>

          {/* System & RBAC Card */}
          <SectionCard
            title="Tizim Huquqlari & Xavfsizlik"
            description="Boshqaruv roli va tizim konfiguratsiyasi"
            icon={Shield}
            contentClassName="space-y-3 p-4 sm:p-5 pt-0 text-xs"
          >
            <div className="rounded-lg border border-border bg-muted/20 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admin Roli:</span>
                <span className="font-semibold text-foreground">{user.role}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                {t('profile.roleHint')}
              </p>
            </div>

            <div className="flex items-center justify-between text-muted-foreground pt-0.5">
              <span>Foydalanuvchi ID:</span>
              <span className="font-mono text-[10px] text-foreground">{user.id.slice(0, 12)}...</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
