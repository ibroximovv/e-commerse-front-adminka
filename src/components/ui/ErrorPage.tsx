import { Button } from 'dgz-ui/button'
import { FileQuestion, ShieldOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function ErrorPage({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: ReactNode
  description: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>

      <Button asChild variant="secondary" className="mt-2">
        <Link to="/">{t('error.goHome')}</Link>
      </Button>
    </div>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <ErrorPage
      icon={<FileQuestion className="size-6" aria-hidden />}
      title={t('error.notFound')}
      description={t('error.notFoundHint')}
    />
  )
}

export function ForbiddenPage() {
  const { t } = useTranslation()

  return (
    <ErrorPage
      icon={<ShieldOff className="size-6" aria-hidden />}
      title={t('error.forbidden')}
      description={t('error.forbiddenHint')}
    />
  )
}
