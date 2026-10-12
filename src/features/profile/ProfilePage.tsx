import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from 'dgz-ui/button'
import { Form } from 'dgz-ui/form'
import { MyInput } from 'dgz-ui-shared/components/form'
import {
  Calendar,
  Check,
  Globe,
  Loader2,
  Phone,
  Shield,
  AlertTriangle,
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
import { formatPhone, isValidPhone, normalizePhone } from '@/lib/phone'
import type { Language } from '@/lib/types'
import { cn, errorMessage, formatDate, formatDateTime } from '@/lib/utils'

type FormValues = {
  full_name: string
  phone: string
  photo?: string
}

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

  /*
   * Phone is the admin's login key — an empty or broken one would lock the
   * account out, so both fields are required (backend: full_name 2–100).
   */
  const schema = z.object({
    full_name: z.string().trim().min(2, t('user.validation.nameMin')).max(100),
    phone: z.string().refine(isValidPhone, t('auth.validation.phoneInvalid')),
    photo: z.string().optional(),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', photo: undefined },
    values: user
      ? {
          full_name: user.full_name ?? '',
          phone: user.phone ?? '',
          photo: user.photo ?? undefined,
        }
      : undefined,
  })
  const { control, handleSubmit, setValue, formState: { isDirty } } = form

  const photo = useWatch({ control, name: 'photo' })
  const phone = useWatch({ control, name: 'phone' })
  const isPhoneChanged = !!user && normalizePhone(phone) !== normalizePhone(user.phone)

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(
      {
        full_name: values.full_name.trim(),
        phone: normalizePhone(values.phone) ?? values.phone,
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
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {user.full_name || t('user.noName')}
              </h2>
              <RoleBadge role={user.role} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {user.phone ? (
                <>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3 text-muted-foreground" />
                    {formatPhone(user.phone)}
                  </span>
                  <span>·</span>
                </>
              ) : null}
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
                    required
                  />
                  <MyInput
                    control={control}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    label={t('profile.phone')}
                    placeholder={t('profile.phonePlaceholder')}
                    required
                  />
                </div>

                {isPhoneChanged ? (
                  <p
                    role="status"
                    className="flex items-start gap-2 rounded-lg border border-border bg-warning-muted p-2.5 text-xs text-warning"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {t('profile.phoneChangeWarning')}
                  </p>
                ) : null}

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    {isDirty
                      ? t('profile.unsavedChanges')
                      : t('profile.lastUpdated', { date: formatDateTime(user.updated_at) })}
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
