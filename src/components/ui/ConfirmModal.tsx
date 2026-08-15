import { Button } from 'dgz-ui/button'
import { AlertTriangle, Archive, Info, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  iconType?: 'delete' | 'archive' | 'warning' | 'info'
  onConfirm: () => Promise<void> | void
}

interface ConfirmModalProps extends ConfirmOptions {
  isOpen: boolean
  onClose: () => void
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'warning',
  iconType = 'warning',
  onConfirm,
}: ConfirmModalProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch {
      // Error handled by caller toast
    } finally {
      setIsLoading(false)
    }
  }

  const renderIcon = () => {
    switch (iconType) {
      case 'delete':
        return (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:bg-rose-500/20">
            <Trash2 className="size-6" />
          </div>
        )
      case 'archive':
        return (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <Archive className="size-6" />
          </div>
        )
      case 'info':
        return (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand/20">
            <Info className="size-6" />
          </div>
        )
      default:
        return (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <AlertTriangle className="size-6" />
          </div>
        )
    }
  }

  const confirmVariant = variant === 'danger' ? 'destructive' : 'default'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog (macOS Alert Style) */}
      <div className="relative z-10 w-full max-w-md scale-100 transform overflow-hidden rounded-2xl border border-border/40 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-200">
        <div className="flex flex-col items-center text-center">
          {renderIcon()}

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-6 flex w-full items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText || t('common.cancel')}
            </Button>

            <Button
              type="button"
              variant={confirmVariant}
              className="flex-1 rounded-xl"
              onClick={() => void handleConfirm()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                confirmText || t('common.confirm')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
