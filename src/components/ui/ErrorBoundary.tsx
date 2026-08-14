import { Button } from 'dgz-ui/button'
import { AlertTriangle } from 'lucide-react'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { withTranslation } from 'react-i18next'
import type { WithTranslation } from 'react-i18next'

interface State {
  error: Error | null
}

/**
 * Render paytidagi xatoni ushlaydi — aks holda React butun daraxtni tashlab
 * yuboradi va foydalanuvchi oq ekran ko'radi.
 *
 * Hook varianti yo'q: `componentDidCatch` faqat klass komponentda ishlaydi.
 * `withTranslation` — klass ichida `useTranslation` chaqirib bo'lmaydi.
 */
class ErrorBoundaryBase extends Component<
  WithTranslation & { children: ReactNode },
  State
> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    const { t, children } = this.props

    if (!error) return children

    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t('error.title')}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">{t('error.generic')}</p>
        </div>

        {/* Xato render paytida bo'lgani uchun holat ishonchsiz — to'liq qayta yuklaymiz. */}
        <Button className="mt-2" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase)
