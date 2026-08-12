import { Avatar, AvatarFallback, AvatarImage } from 'dgz-ui/avatar'
import { Button } from 'dgz-ui/button'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fileUrl, uploadImage, UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from '@/lib/api'
import { errorMessage, initials } from '@/lib/utils'

/**
 * Rasm yuklaydi va NISBIY yo'l qaytaradi ("uploads/..."). Bazaga aynan shu
 * saqlanadi, ko'rsatishda `fileUrl()`.
 *
 * Hajm va format backend'da ham tekshiriladi, lekin bu yerda oldindan
 * tekshirish 5MB faylni behuda yuborishning oldini oladi.
 */
export function AvatarUpload({
  value,
  onChange,
  name,
  email,
}: {
  value?: string
  onChange: (path: string | undefined) => void
  name?: string
  email?: string
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file?: File) => {
    if (!file) return

    if (!UPLOAD_ACCEPT.includes(file.type)) {
      toast.error(t('upload.wrongType'))
      return
    }

    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error(t('upload.tooLarge'))
      return
    }

    setUploading(true)
    try {
      onChange(await uploadImage(file))
    } catch (error) {
      toast.error(errorMessage(error, t('upload.failed')))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-20">
          <AvatarImage src={fileUrl(value)} alt="" />
          <AvatarFallback className="bg-brand-muted text-lg font-medium text-brand">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>

        {uploading ? (
          <div className="absolute inset-0 grid place-items-center rounded-full bg-background/70">
            <Loader2 className="size-5 animate-spin text-brand" aria-hidden />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden />
            {value ? t('profile.changePhoto') : t('profile.uploadPhoto')}
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange(undefined)}
              className="text-destructive"
            >
              <Trash2 className="size-4" aria-hidden />
              {t('profile.removePhoto')}
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">{t('upload.hint')}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT.join(',')}
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  )
}
