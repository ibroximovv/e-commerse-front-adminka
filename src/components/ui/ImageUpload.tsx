import { Button } from 'dgz-ui/button'
import { Image as ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { fileUrl, uploadImage, UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from '@/lib/api'
import { errorMessage } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxCount?: number
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxCount = 5,
  label,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const imageList = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string' && value
      ? [value]
      : []

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!UPLOAD_ACCEPT.includes(file.type)) {
        toast.error(t('upload.wrongType'))
        continue
      }
      if (file.size > UPLOAD_MAX_BYTES) {
        toast.error(t('upload.tooLarge'))
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      if (multiple) {
        const remainingSlots = maxCount - imageList.length
        const filesToUpload = validFiles.slice(0, remainingSlots)
        
        const uploadedPaths = await Promise.all(
          filesToUpload.map((file) => uploadImage(file)),
        )
        onChange([...imageList, ...uploadedPaths])
      } else {
        const path = await uploadImage(validFiles[0])
        onChange(path)
      }
    } catch (error) {
      toast.error(errorMessage(error, t('upload.failed')))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    if (multiple) {
      const updated = imageList.filter((_, i) => i !== index)
      onChange(updated)
    } else {
      onChange('')
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <div className="flex flex-wrap items-center gap-3">
        {imageList.map((path, idx) => (
          <div
            key={path + idx}
            className="group relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40"
          >
            <img
              src={fileUrl(path)}
              alt=""
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(idx)}
                className="text-white hover:bg-destructive/80 hover:text-white"
                title={t('common.delete')}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {(!multiple && imageList.length === 0) || (multiple && imageList.length < maxCount) ? (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background transition-colors hover:border-brand hover:bg-brand-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin text-brand" />
            ) : (
              <>
                <Plus className="size-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {multiple ? `${imageList.length}/${maxCount}` : <ImageIcon className="size-4" />}
                </span>
              </>
            )}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={UPLOAD_ACCEPT.join(',')}
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">{t('upload.hint')}</p>
    </div>
  )
}
